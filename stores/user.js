import { navigateTo } from "nuxt/app";
import { defineStore } from "pinia";
import { fetchUserProfile } from "~/services/api.js"; // Import the function

export const useUserStore = defineStore("user", {
  state: () => ({
    isMenuOverlay: false,
    isLoading: false,
    cart: [], // Assuming this holds the main cart info
    cartItems: [], // This will hold the cart items fetched from the server
    products: [],
    deleteProduct: null,
    refreshFlag: 1,
    checkout: [],
    order: [],
    user: null, // auth info
    profile: null, // profile info
    isAdmin: false,
    // Store closing time settings
    closingHour: 22, // Default: 10 PM in 24-hour format
    closingMinute: 0,
    openingHour: 6, // Default: 6 AM in 24-hour format
    openingMinute: 0,
    // New state for cancelled orders
    cancelledOrders: [],
    showCancelledOrdersPopup: false,
    hasSeenCancelledOrders: false,
  }),

  actions: {
    // Update closing time with promise
    async updateClosingTime(hour, minute) {
      this.isLoading = true;
      try {
        // Parse input values
        const parsedHour = parseInt(hour);
        const parsedMinute = parseInt(minute);

        // Update the database
        const response = await $fetch("/api/prisma/update-store-config", {
          method: "POST",
          body: {
            openingHour: this.openingHour,
            openingMinute: this.openingMinute,
            closingHour: parsedHour,
            closingMinute: parsedMinute,
          },
        });

        if (response.success) {
          // Update local state
          this.closingHour = parsedHour;
          this.closingMinute = parsedMinute;

          // Also update localStorage as fallback
          localStorage.setItem("closingHour", parsedHour.toString());
          localStorage.setItem("closingMinute", parsedMinute.toString());

          return true;
        } else {
          throw new Error("Failed to update store hours in database");
        }
      } catch (error) {
        console.error("Error saving closing time:", error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    // Update opening time with promise
    async updateOpeningTime(hour, minute) {
      this.isLoading = true;
      try {
        // Parse input values
        const parsedHour = parseInt(hour);
        const parsedMinute = parseInt(minute);

        // Update the database
        const response = await $fetch("/api/prisma/update-store-config", {
          method: "POST",
          body: {
            openingHour: parsedHour,
            openingMinute: parsedMinute,
            closingHour: this.closingHour,
            closingMinute: this.closingMinute,
          },
        });

        if (response.success) {
          // Update local state
          this.openingHour = parsedHour;
          this.openingMinute = parsedMinute;

          // Also update localStorage as fallback
          localStorage.setItem("openingHour", parsedHour.toString());
          localStorage.setItem("openingMinute", parsedMinute.toString());

          return true;
        } else {
          throw new Error("Failed to update store hours in database");
        }
      } catch (error) {
        console.error("Error saving opening time:", error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    // Format closing time for display
    formattedClosingTime() {
      return this.formatTime(this.closingHour, this.closingMinute);
    },

    // Format opening time for display
    formattedOpeningTime() {
      return this.formatTime(this.openingHour, this.openingMinute);
    },

    // Helper to format time
    formatTime(hour, minute) {
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
      const displayMinute = minute.toString().padStart(2, "0");
      return `${displayHour}:${displayMinute} ${period}`;
    },

    // Check if store is closed and redirect if needed
    checkStoreHours() {
      // Get current time in Philippines
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const phTime = new Date(utcTime + 3600000 * 8); // UTC+8 for Philippines

      const currentHour = phTime.getHours();
      const currentMinute = phTime.getMinutes();

      // Check if current time is outside operating hours
      const isBeforeOpening =
        currentHour < this.openingHour ||
        (currentHour === this.openingHour &&
          currentMinute < this.openingMinute);

      const isAfterClosing =
        currentHour > this.closingHour ||
        (currentHour === this.closingHour &&
          currentMinute >= this.closingMinute);

      // Store is closed if before opening or after closing
      const isStoreClosed = isBeforeOpening || isAfterClosing;

      // Get current route
      const route = useRoute();

      // Skip the check for admin routes, login page and closed page
      const isAdminRoute = route.fullPath.startsWith("/admin");
      const isLoginPage = route.fullPath === "/login";
      const isClosedPage = route.fullPath === "/closed";

      // If store is closed and user is not on admin/login/closed page, redirect to closed
      if (isStoreClosed && !isAdminRoute && !isLoginPage && !isClosedPage) {
        // Allow both admin and client users to browse when store is closed
        if (this.profile?.role !== "ADMIN" && this.profile?.role !== "CLIENT") {
          navigateTo("/closed");
          return true; // Store is closed
        }
      }

      return false; // Store is open
    },

    // Initialize time settings from database
    async initializeTimeSettings() {
      try {
        // Try to get from database first
        const storeConfig = await $fetch("/api/prisma/get-store-config");

        if (storeConfig) {
          // Update state with values from database
          this.openingHour = storeConfig.openingHour;
          this.openingMinute = storeConfig.openingMinute;
          this.closingHour = storeConfig.closingHour;
          this.closingMinute = storeConfig.closingMinute;

          // Also update localStorage as fallback
          localStorage.setItem(
            "openingHour",
            storeConfig.openingHour.toString()
          );
          localStorage.setItem(
            "openingMinute",
            storeConfig.openingMinute.toString()
          );
          localStorage.setItem(
            "closingHour",
            storeConfig.closingHour.toString()
          );
          localStorage.setItem(
            "closingMinute",
            storeConfig.closingMinute.toString()
          );

          return true;
        }
      } catch (error) {
        console.error("Error fetching store hours from database:", error);

        // Fallback to localStorage if database fetch fails
        const storedClosingHour = localStorage.getItem("closingHour");
        const storedClosingMinute = localStorage.getItem("closingMinute");
        const storedOpeningHour = localStorage.getItem("openingHour");
        const storedOpeningMinute = localStorage.getItem("openingMinute");

        if (storedClosingHour) this.closingHour = parseInt(storedClosingHour);
        if (storedClosingMinute)
          this.closingMinute = parseInt(storedClosingMinute);
        if (storedOpeningHour) this.openingHour = parseInt(storedOpeningHour);
        if (storedOpeningMinute)
          this.openingMinute = parseInt(storedOpeningMinute);
      }
    },

    // Check and restore session if needed
    async checkAndRestoreSession() {
      try {
        const client = useSupabaseClient();
        const {
          data: { session },
          error,
        } = await client.auth.getSession();

        if (error) {
          console.error("Error checking session:", error);
          return false;
        }

        if (!session) {
          console.warn("No active session found");
          return false;
        }

        // If we have a session but user state is not set, restore it
        if (session && !this.user) {
          this.user = session.user;
          try {
            const profileData = await fetchUserProfile(this.user.id);
            this.profile = profileData;

            // Check if user is unverified and log them out if so
            if (this.profile && this.profile.status === "UNVERIFIED") {
              console.warn("Unverified user attempted to restore session");
              await client.auth.signOut();
              this.user = null;
              this.profile = null;
              return false;
            }

            // Check if user is suspended and log them out if so
            if (this.profile && this.profile.status === "SUSPENDED") {
              console.warn("Suspended user attempted to restore session");
              await client.auth.signOut();
              this.user = null;
              this.profile = null;
              return false;
            }

            // Check if user is inactive and log them out if so
            if (this.profile && this.profile.status === "INACTIVE") {
              console.warn("Inactive user attempted to restore session");
              await client.auth.signOut();
              this.user = null;
              this.profile = null;
              return false;
            }

            // Only fetch cart items if profile exists and user is not an admin
            if (this.profile && this.profile.role !== "Admin") {
              await this.fetchCartItems();
            }
          } catch (err) {
            console.error("Error fetching user profile:", err);
          }
          return true;
        }

        return !!session;
      } catch (err) {
        console.error("Error in checkAndRestoreSession:", err);
        return false;
      }
    },

    // Fetch user profile and cart items
    async fetchUser() {
      //    console.log("FETCHING!");

      // if (this.user) {
      //   console.log("ALREADY LOGGED IN");
      //   return; // Skip fetching if user is already set
      // }
      //  console.log("FETCH USER RUNNING");
      this.isLoading = false;
      try {
        const client = useSupabaseClient();
        const { data, error } = await client.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
        } else {
          this.user = data.user;
          //    console.log("Fetched user ID:", this.user.id);
          const profileData = await fetchUserProfile(this.user.id);
          this.profile = profileData;
          if (!this.isAdmin()) {
            await this.fetchCartItems();
          }

          // Initialize time settings
          await this.initializeTimeSettings();

          // // Clear storage and cookies on successful login
          // localStorage.clear();
          // sessionStorage.clear();
          // this.clearCookies();
        }
      } catch (err) {
        console.error("Unexpected error fetching user:", err);
        this.isLoading = false;
      } finally {
        this.isLoading = false; // Ensure isLoading is false after the fetch completes
      }
    },

    isAdmin() {
      if (!this.user || !this.profile) return false;
      return this.profile.role.toUpperCase() === "ADMIN";
    },

    // Logout action
    async logout() {
      //   console.log("Logout function called");
      const client = useSupabaseClient();

      try {
        // Sign out from Supabase

        // Clear user-related state
        this.user = null;
        this.profile = null;
        this.cartItems = [];
        this.cart = [];
        this.isAdmin = false;
        this.isMenuOverlay = false;

        // Clear storage and cookies
        localStorage.clear();
        sessionStorage.clear();
        this.clearCookies();

        //console.log("Storage and cookies cleared");
        await client.auth.signOut();
        // console.log("User signed out from Supabase");
        // console.log("LOGOUT SUCCESS");
        window.location.reload();
      } catch (error) {
        console.error("Error during logout:", error);
      }
    },

    // New action to fetch the cart items
    async fetchCartItems() {
      if (this.isAdmin === true) return;

      //   console.log("FETCH CART RUNNING");
      this.isLoading = false;
      let cartResponse = ref(null);

      const userId = this.user?.id;

      if (!userId) {
        console.warn("No user ID found, cannot fetch cart items.");
        this.isLoading = false;
        return;
      }
      //     console.log("Fetching cart items for user ID:", userId);
      this.refreshFlag = 0;

      if (userId) {
        try {
          cartResponse.value = await useFetch(
            `/api/prisma/get-cart-by-user/${userId}`
          );
          // console.log("THIS IS A TEST");
          if (cartResponse.value.data) {
            this.cart = cartResponse.value.data;
          }

          if (cartResponse.value.data && cartResponse.value.data.cartItems) {
            this.cartItems = cartResponse.value.data.cartItems;
            // console.log("Cart items fetched successfully");
            this.isLoading = false;
          } else {
            this.isLoading = false;
            console.warn("No cart items found for this user.");
          }
        } catch (error) {
          console.error("Failed to fetch cart:", error);
          this.isLoading = false;
        } finally {
          this.isLoading = false;
        }
      } else {
        console.warn("No user ID found, cannot fetch cart items.");
      }
      this.isLoading = false;
    },

    async fetchOrders() {
      if (this.isAdmin === true) return;
      //  console.log("FETCH ORDER RUNNING");
      this.isLoading = true;
      let orderResponse = ref(null);
      const userId = this.user?.id;

      if (!userId) {
        console.warn("No user ID found, cannot fetch ORDER items.");
        this.isLoading = false;
        return;
      }
      //  console.log("Fetching ORDERSSsS for user ID:", userId);

      if (userId) {
        try {
          //  console.log("THIS IS A ORDER TEST");

          orderResponse.value = await useFetch(
            `/api/prisma/get-all-orders-by-user/${userId}`
          );
          //  console.log("Done Order");

          if (orderResponse.value.data) {
            this.order = orderResponse.value.data;
          }
          // console.log(orderResponse.value.data);
          // console.log("SUCCESS");
          this.isLoading = false;
        } catch (error) {
          console.error("Failed to fetch cart:", error);
          this.isLoading = false;
        } finally {
          this.isLoading = false;
        }
      } else {
        console.warn("No user ID found, cannot fetch cart items.");
      }
      this.isLoading = false;
    },

    //Function to clear cookies
    clearCookies() {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    },

    async checkAndCancelPendingOrders() {
      try {
        // Make sure we have the user profile and time settings
        if (!this.profile) {
          await this.fetchUser();
        }
        await this.initializeTimeSettings();

        // Get current time in Philippines
        const now = new Date();
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
        const phTime = new Date(utcTime + 3600000 * 8); // UTC+8 for Philippines

        const currentHour = phTime.getHours();
        const currentMinute = phTime.getMinutes();

        // Check if it's closing time
        const isClosingTime =
          currentHour > this.closingHour ||
          (currentHour === this.closingHour && currentMinute >= this.closingMinute);

        if (isClosingTime) {
          console.log("Store is closing, cancelling all pending buyer orders...");
          const response = await $fetch("/api/prisma/cancel-pending-orders", {
            method: "POST"
          });
          
          if (response.success) {
            if (response.cancelledOrders.length > 0) {
              console.log(`Cancelled ${response.cancelledOrders.length} pending orders`);
              this.cancelledOrders = response.cancelledOrders;
              this.hasSeenCancelledOrders = false;
              localStorage.removeItem("hasSeenCancelledOrders");
              
              // Show toast notification about cancelled orders
              const message = `${response.cancelledOrders.length} order(s) have been automatically cancelled due to store closing.`;
              // You can implement a notification system here if needed
            }
          } else {
            console.error("Failed to cancel pending orders:", response.message);
          }
        }
      } catch (error) {
        console.error("Error checking and cancelling pending orders:", error);
      }
    },

    async fetchTodaysCancelledOrders() {
      if (!this.user) return;

      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await $fetch(
          `/api/prisma/get-cancelled-orders-by-date/${this.user.id}`,
          {
            method: "POST",
            body: { date: today },
          }
        );

        if (response.success) {
          this.cancelledOrders = response.orders;

          // Show popup if there are cancelled orders and user hasn't seen them
          if (response.orders.length > 0 && !this.hasSeenCancelledOrders) {
            const hasSeenCancelledOrders = localStorage.getItem(
              "hasSeenCancelledOrders"
            );
            if (!hasSeenCancelledOrders) {
              this.showCancelledOrdersPopup = true;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching cancelled orders:", error);
      }
    },

    markCancelledOrdersAsSeen() {
      this.hasSeenCancelledOrders = true;
      this.showCancelledOrdersPopup = false;
      localStorage.setItem("hasSeenCancelledOrders", "true");
    },
  },
  persist: {
    paths: ["user", "profile", "isAdmin"], // Only persist the 'user' and 'profile' states
  },

  //persist: true, // This will persist the store data
});
