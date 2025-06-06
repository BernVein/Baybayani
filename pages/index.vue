<template>
  <AdminLayout>
    <div id="IndexPage" class="max-w-[1200px] mx-auto px-2">
      <!-- Loading state -->
      <div v-if="isLoading" class="flex justify-center items-center min-h-[200px]">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>

      <!-- Error state -->
      <div v-else-if="!products?.data" class="text-center text-gray-600 py-8">
        Unable to load products. Please try again later.
      </div>

      <!-- Products grid -->
      <div v-else class="grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4">
        <div v-if="filteredProducts.length === 0" class="col-span-full text-center text-gray-600 py-8">
          No products available at the moment.
        </div>
        
        <div v-for="product in filteredProducts" :key="product.id" :class="[
          'transition-all duration-500 ease-in-out transform rounded-md overflow-hidden'
        ]" @click="product.stock > 0 ? handleProductClick(product) : null">
          <div :class="[
            'transition-all duration-500 ease-in-out rounded-md',
            product.stock > 0 ? 'group-hover:saturate-150 group-hover:shadow-lg group-hover:bg-white group-hover:-translate-y-1' : ''
          ]">
            <ProductComponent :product="product" />

            <!-- Stock Status Badge -->
            <div v-if="product.stock <= 0"
              class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              SOLD OUT
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancelled Orders Popup -->
    <CancelledOrdersPopup
      :show="showCancelledOrders"
      :orders="cancelledOrders"
      @close="showCancelledOrders = false"
    />
  </AdminLayout>
</template>

<script setup>
import AdminLayout from "~/layouts/AdminLayout.vue";
import { useUserStore } from "~/stores/user";
import { ref, onBeforeMount, computed, onMounted, watchEffect } from "vue";
import { useRoute } from "vue-router";
import CancelledOrdersPopup from "~/components/CancelledOrdersPopup.vue";
import { isStoreClosed } from "~/utils/timeUtils";

const user = useSupabaseUser();
const userStore = useUserStore();
let products = ref(null);
const route = useRoute();

// Add loading state
const isLoading = ref(true);

// Function to get user role
const getUserRole = computed(() => userStore.profile?.role || null);

// Add state for cancelled orders popup
const showCancelledOrders = ref(false);
const cancelledOrders = ref([]);

// Function to fetch cancelled orders
const fetchCancelledOrders = async () => {
  try {
    const response = await fetch("/api/prisma/get-cancelled-orders");
    const data = await response.json();
    if (data && data.orders && data.orders.length > 0) {
      cancelledOrders.value = data.orders;
      showCancelledOrders.value = true;
    }
  } catch (error) {
    console.error("Error fetching cancelled orders:", error);
  }
};

// Initialize data and check for cancelled orders
onMounted(async () => {
  try {
    // Start loading state
    isLoading.value = true;

    // Wait for user profile and time settings to be loaded
    if (!userStore.profile) {
      await userStore.fetchUser();
    }
    await userStore.initializeTimeSettings();
    
    const role = userStore.profile?.role?.toUpperCase();
    console.log("User role after profile load:", role);
    
    // Check if store is closed (only for buyers)
    if (role === "BUYER" && isStoreClosed(userStore)) {
      navigateTo("/closed");
      return;
    }

    // Start fetching products if user is logged in and is a buyer or client
    if (user.value && (role === "BUYER" || role === "CLIENT")) {
      await fetchProducts();
      
      // Fetch cancelled orders only for buyers
      if (role === "BUYER") {
        await fetchCancelledOrders();
      }
    }
  } catch (error) {
    console.error("Error in onMounted:", error);
  } finally {
    isLoading.value = false;
  }
});

// Separate function to fetch products
const fetchProducts = async () => {
  try {
    console.log("Fetching products...");
    const response = await useFetch("/api/prisma/get-all-products", {
      key: 'products',
      cache: 'no-cache'
    });
    
    if (response.error.value) {
      console.error("Error fetching products:", response.error.value);
      products.value = { data: [] };
    } else {
      products.value = { data: Array.isArray(response.data.value) ? response.data.value : [] };
    }
  } catch (err) {
    console.error("Error fetching products:", err);
    products.value = { data: [] };
  }
};

watchEffect(async () => {
  const role = getUserRole.value;
  console.log("watchEffect running with user:", user.value, "role:", role, "route:", route.fullPath);
  
  if (route.fullPath === "/") {
    // If no user, redirect to login
    if (!user.value) {
      navigateTo("/login");
      return;
    }

    // Wait for user profile and time settings to be loaded
    if (!userStore.profile) {
      await userStore.fetchUser();
    }
    await userStore.initializeTimeSettings();
    
    const role = userStore.profile?.role?.toUpperCase();
    
    // If admin, redirect to dashboard
    if (role === "ADMIN") {
      navigateTo("/admin/dashboard");
      return;
    }

    // Check if store is closed (only for buyers)
    if (role === "BUYER" && isStoreClosed(userStore)) {
      navigateTo("/closed");
      return;
    }

    // For buyers and clients, fetch products if not already loaded
    if ((role === "BUYER" || role === "CLIENT") && !products.value) {
      fetchProducts();
    }
  }
});

// Middleware to check if the store is open
definePageMeta({
  middleware: ["auth"]
});

// Add debugging to computed property
const filteredProducts = computed(() => {
  console.log("Computing filteredProducts with products.value:", products.value);
  if (products.value && products.value.data) {
    const filtered = products.value.data.filter(
      (product) => !product.hidden && !product.isDeleted
    );
    console.log("Filtered products:", filtered);
    return filtered;
  }
  console.log("No products data available");
  return [];
});

const handleProductClick = (product) => {
  // console.log("Product clicked:", product);
  window.location.href = `/item/${product.id}`
};

// CometChat is already initialized in AdminLayout.vue
// No need to initialize it again here

// console.log("LOADING FLAGGGG");
// console.log(userStore.isLoading);

</script>

<style>
/* No additional styles needed for the CometChat Docked Widget */
</style>
