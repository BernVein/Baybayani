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
  }),

  actions: {
    // Fetch user profile and cart items
    async fetchUser() {
      console.log("FETCHING!");

      if (this.user) {
        console.log("ALREADY LOGGED IN");
        return; // Skip fetching if user is already set
      }
      console.log("FETCH USER RUNNING");
      this.isLoading = true;
      try {
        const client = useSupabaseClient();
        const { data, error } = await client.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
        } else {
          this.user = data.user;
          console.log("Fetched user ID:", this.user.id);
          const profileData = await fetchUserProfile(this.user.id);
          this.profile = profileData;
          if (!this.isAdmin()) {
            await this.fetchCartItems();
          }
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
      console.log("ROLE", this.profile.role);
      if (this.profile.role === "Admin") {
        this.isAdmin = true;
        return true;
      }
      this.isAdmin = false;
      return false;
    },

    // Logout action
    logout() {
      const client = useSupabaseClient();
      const route = useRoute();
      this.user = null;
      this.profile = null;
      this.cartItems = []; // Clear cart items on logout
      this.cart = [];
      this.isAdmin = false;
      order = [];
      this.isMenuOverlay = false;
      client.auth.signOut();
      console.log("LOGOUT SUCESS");
      navigateTo("/login");
      //window.location.reload();
    },

    // New action to fetch the cart items
    async fetchCartItems() {
      //console.log("TRY HERE");
      //console.log(this.refreshFlag);
      //console.log(this.cartItems.length);
      //console.log("TRY HERE2");
      if (this.isAdmin === true) return;

      //if (this.cartItems.length > 0 && this.refreshFlag === 0) return;
      console.log("FETCH CART RUNNING");
      this.isLoading = true;
      let cartResponse = ref(null);

      const userId = this.user?.id;

      if (!userId) {
        console.warn("No user ID found, cannot fetch cart items.");
        this.isLoading = false; // Set loading to false if no user ID
        return;
      }
      console.log("Fetching cart items for user ID:", userId);
      this.refreshFlag = 0;

      if (userId) {
        try {
          // Replace with your actual API endpoint
          cartResponse.value = await useFetch(
            `/api/prisma/get-cart-by-user/${userId}`
          );
          console.log("THIS IS A TEST");
          if (cartResponse.value.data) {
            this.cart = cartResponse.value.data;
          }

          if (cartResponse.value.data && cartResponse.value.data.cartItems) {
            this.cartItems = cartResponse.value.data.cartItems; // Set the fetched cart items
            //this.products = cartResponse.value.data.cartItems.product;
            //console.log(this.cartItems[0].product);
            //console.log(this.products);

            console.log("Cart items fetched successfully");
            this.isLoading = false;
          } else {
            this.isLoading = false;
            console.warn("No cart items found for this user.");
          }
        } catch (error) {
          console.error("Failed to fetch cart:", error);
          this.isLoading = false;
        } finally {
          this.isLoading = false; // Set loading to false after the fetch is done
        }
      } else {
        console.warn("No user ID found, cannot fetch cart items.");
      }
      this.isLoading = false;
    },

    async fetchOrders() {
      if (this.isAdmin === true) return;
      console.log("FETCH ORDER RUNNING");
      this.isLoading = true;
      let orderResponse = ref(null);
      const userId = this.user?.id;

      if (!userId) {
        console.warn("No user ID found, cannot fetch ORDER items.");
        this.isLoading = false; // Set loading to false if no user ID
        return;
      }
      console.log("Fetching ORDERSSsS for user ID:", userId);
      //this.refreshFlag = 0;

      if (userId) {
        try {
          console.log("THIS IS A ORDER TEST");

          orderResponse.value = await useFetch(
            `/api/prisma/get-all-orders-by-user/${userId}`
          );
          console.log("Done Order");

          if (orderResponse.value.data) {
            this.order = orderResponse.value.data;
          }
          console.log(orderResponse.value.data);
          console.log("SUCCESS");
        } catch (error) {
          console.error("Failed to fetch cart:", error);
          this.isLoading = false;
        } finally {
          this.isLoading = false; // Set loading to false after the fetch is done
        }
      } else {
        console.warn("No user ID found, cannot fetch cart items.");
      }
      this.isLoading = false;
    },
  },

  persist: true, // This will persist the store data
});
