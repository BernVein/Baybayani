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
  }),

  actions: {
    // Update closing time with promise
    async updateClosingTime(hour, minute) {
      this.isLoading = true;
      try {
        this.closingHour = parseInt(hour);
        this.closingMinute = parseInt(minute);
        
        // Use promises to ensure localStorage operations complete
        await Promise.all([
          new Promise(resolve => {
            localStorage.setItem('closingHour', hour);
            resolve();
          }),
          new Promise(resolve => {
            localStorage.setItem('closingMinute', minute);
            resolve();
          })
        ]);
        
        // Add a small delay to ensure data is properly saved
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return true;
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
        this.openingHour = parseInt(hour);
        this.openingMinute = parseInt(minute);
        
        // Use promises to ensure localStorage operations complete
        await Promise.all([
          new Promise(resolve => {
            localStorage.setItem('openingHour', hour);
            resolve();
          }),
          new Promise(resolve => {
            localStorage.setItem('openingMinute', minute);
            resolve();
          })
        ]);
        
        // Add a small delay to ensure data is properly saved
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return true;
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
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
      const displayMinute = minute.toString().padStart(2, '0');
      return `${displayHour}:${displayMinute} ${period}`;
    },

    // Initialize time settings from localStorage
    initializeTimeSettings() {
      const storedClosingHour = localStorage.getItem('closingHour');
      const storedClosingMinute = localStorage.getItem('closingMinute');
      const storedOpeningHour = localStorage.getItem('openingHour');
      const storedOpeningMinute = localStorage.getItem('openingMinute');
      
      if (storedClosingHour) this.closingHour = parseInt(storedClosingHour);
      if (storedClosingMinute) this.closingMinute = parseInt(storedClosingMinute);
      if (storedOpeningHour) this.openingHour = parseInt(storedOpeningHour);
      if (storedOpeningMinute) this.openingMinute = parseInt(storedOpeningMinute);
    },

    // Check and restore session if needed
    async checkAndRestoreSession() {
      try {
        const client = useSupabaseClient();
        const { data: { session }, error } = await client.auth.getSession();
        
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
          const profileData = await fetchUserProfile(this.user.id);
          this.profile = profileData;
          if (!this.isAdmin()) {
            await this.fetchCartItems();
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
          this.initializeTimeSettings();

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
      if (!this.user) return false;
      //  console.log("ROLE", this.profile.role);
      if (this.profile.role === "Admin") {
        this.isAdmin = true;
        return true;
      }

      this.isAdmin = false;
      return false;
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
  },
  persist: {
    paths: ["user", "profile", "isAdmin"], // Only persist the 'user' and 'profile' states
  },

  //persist: true, // This will persist the store data
});
