<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-6">
    <div class="bg-white p-5 sm:p-8 rounded-lg shadow-md w-full max-w-2xl text-center">
      <!-- Store Logo -->
      <div class="mb-6 flex justify-center">
        <img width="170" src="/baybayani-logo.png" alt="Baybayani Logo" class="h-auto" />
      </div>

      <h1 class="text-xl sm:text-2xl font-bold text-red-600 mb-4">Store Closed</h1>
      
      <div class="mb-5 sm:mb-6">
        <p class="text-gray-700 mb-2 text-sm sm:text-base">We're currently closed for the day.</p>
        <p class="text-gray-700 text-sm sm:text-base">Our operating hours are:</p>
        <p class="font-medium text-gray-800 text-base sm:text-lg">{{ userStore.formattedOpeningTime() }} - {{ userStore.formattedClosingTime() }} PHT</p>
      </div>
      
      <div class="bg-gray-100 p-3 sm:p-4 rounded-md mb-5 sm:mb-6">
        <p class="text-gray-700 text-sm sm:text-base">Current time: <span class="font-medium">{{ currentTime }}</span> PHT</p>
        <p class="text-gray-700 text-sm sm:text-base">We will reopen at <span class="font-medium">{{ userStore.formattedOpeningTime() }}</span></p>
      </div>

      <!-- Cancelled Orders Section -->
      <div v-if="user && cancelledOrders.length > 0" class="mt-6 mb-6">
        <CancelledOrders 
          :orders="cancelledOrders"
          message="These orders were cancelled due to store closing time."
        />
      </div>
      
      <div class="border-t pt-4 mt-4">
        <p class="text-sm text-gray-500">Thank you for your understanding.</p>
        <button v-if="user" @click="logout" class="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
          Logout ({{ countdown }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '~/stores/user';
const userStore = useUserStore();
const user = useSupabaseUser();
const currentTime = ref('');
const countdown = ref(10);
let countdownInterval = null;
const cancelledOrders = ref([]);

// Fetch cancelled orders for today
const fetchCancelledOrders = async () => {
  if (!user.value) return;
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await $fetch(`/api/prisma/get-cancelled-orders-by-date/${user.value.id}`, {
      method: 'POST',
      body: { date: today }
    });
    
    if (response.success) {
      cancelledOrders.value = response.orders;
    }
  } catch (error) {
    console.error('Error fetching cancelled orders:', error);
  }
};

// Logout function
const logout = async () => {
  clearInterval(countdownInterval);
  await userStore.logout();
  window.location.href = "/login";
};

// Update current time every second
const updateTime = () => {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const phTime = new Date(utcTime + (3600000 * 8));
  
  currentTime.value = phTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

onMounted(async () => {
  // Check if user is a client, redirect to homepage
  const role = userStore.profile?.role?.toUpperCase();
  if (role === "CLIENT") {
    navigateTo("/");
    return;
  }

  // Initialize time settings first (now async)
  await userStore.initializeTimeSettings();
  
  // Then start timers
  updateTime();
  setInterval(updateTime, 1000);

  // Fetch cancelled orders if user is logged in
  if (user.value) {
    await fetchCancelledOrders();
  }

  // Start the logout countdown only if the user is logged in
  if (user.value) {
    countdownInterval = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--;
      } else {
        clearInterval(countdownInterval);
        logout(); // Auto-logout when countdown reaches 0
      }
    }, 1000);
  }
});

// Clear interval when the component is unmounted
onUnmounted(() => {
  clearInterval(countdownInterval);
});
</script> 