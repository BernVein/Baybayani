<template>
  <AdminLayout>
    <div id="IndexPage" class="max-w-[1200px] mx-auto px-2">
      <div class="grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4">
        <div v-if="filteredProducts" v-for="product in filteredProducts" :key="product.id"
          class="transition-all duration-500 ease-in-out transform hover:scale-105 group rounded-md overflow-hidden"
          @click="handleProductClick(product)">
          <div
            class="transition-all duration-500 ease-in-out group-hover:saturate-150 group-hover:shadow-lg group-hover:bg-white group-hover:-translate-y-1 rounded-md">
            <ProductComponent :product="product" />
          </div>
        </div>
      </div>
    </div>
    <!-- CometChat Docked Widget -->
  </AdminLayout>
</template>

<script setup>
import AdminLayout from "~/layouts/AdminLayout.vue";
import { useUserStore } from "~/stores/user";
import { ref, onBeforeMount, computed, onMounted, watchEffect } from "vue";
import { useRoute } from "vue-router";
const user = useSupabaseUser();

const userStore = useUserStore();

let products = ref(null);

const route = useRoute();
const role = userStore.profile?.role;

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
  userStore.initializeTimeSettings();
  
  // Check if store is closed and redirect if needed
  if (isStoreClosed() && role !== "Admin") {
    navigateTo("/closed");
  }
});

watchEffect(() => {
  if (route.fullPath == "/" &&
    (!user.value || role === "Admin")) {
    navigateTo("/admin/dashboard");
  }
  else if (route.fullPath == "/" && !user.value) {
    navigateTo("/login");
  }
  // Also check for store closing time when user is on the homepage
  else if (route.fullPath == "/" && isStoreClosed() && role !== "Admin") {
    navigateTo("/closed");
  }
});

onBeforeMount(async () => {
  products.value = await useFetch("/api/prisma/get-all-products");
  setTimeout(() => (userStore.isLoading = true), 1000);
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
