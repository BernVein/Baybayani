<template>
  <AdminLayout>
    <div id="IndexPage" class="max-w-[1200px] mx-auto px-2">
      <div class="grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4">
        <div v-if="filteredProducts" v-for="product in filteredProducts" :key="product.id" :class="[
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

const user = useSupabaseUser();
const userStore = useUserStore();
let products = ref(null);
const route = useRoute();
const role = userStore.profile?.role;

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
  if (user.value && role === "Buyer") {
    await fetchCancelledOrders();
  }
});

watchEffect(async () => {
  // First check if user is logged in and is a buyer
  if (user.value && role === "Buyer") {
    if (route.fullPath === "/") {
      // Fetch products and check for cancelled orders
      products.value = await useFetch("/api/prisma/get-all-products");
      await fetchCancelledOrders();
    }
  } else if (route.fullPath === "/") {
    // Handle redirects for non-buyers
    if (!user.value) {
      navigateTo("/login");
    } else if (role === "Admin") {
      navigateTo("/admin/dashboard");
    }
  }
});

// Middleware to check if the store is open
definePageMeta({
  middleware: ["auth"]
});

// Function to check if store is closed
const isStoreClosed = () => {
  // Check if website is closed based on Philippines time (UTC+8)
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const phTime = new Date(utcTime + (3600000 * 8)); // UTC+8 for Philippines

  const currentHour = phTime.getHours();
  const currentMinute = phTime.getMinutes();

  // Check if current time is outside operating hours
  const isBeforeOpening =
    currentHour < userStore.openingHour ||
    (currentHour === userStore.openingHour && currentMinute < userStore.openingMinute);

  const isAfterClosing =
    currentHour > userStore.closingHour ||
    (currentHour === userStore.closingHour && currentMinute >= userStore.closingMinute);

  return isBeforeOpening || isAfterClosing;
};

// Initialize time settings
onMounted(() => {
  // userStore.initializeTimeSettings();

  // // Check if store is closed and redirect if needed
  // if (isStoreClosed() && role !== "Admin") {
  //   navigateTo("/closed");
  // }
});

// Compute filtered products to exclude hidden and deleted products
const filteredProducts = computed(() => {
  if (products.value && products.value.data) {
    return products.value.data.filter(
      (product) => !product.hidden && !product.isDeleted
    );
  }
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
