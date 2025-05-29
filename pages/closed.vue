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

      <!-- Refresh Button with Instructions -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p class="text-gray-700 text-sm mb-3">
          If it's already our opening time and you're still seeing this page, click the refresh button below to check if the store is open.
        </p>
        <button @click="checkAndRedirect" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Check if Store is Open
        </button>
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
          Logout
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
const cancelledOrders = ref([]);

// Check if store is open and redirect if it is
const checkAndRedirect = async () => {
  try {
    // Initialize time settings first
    await userStore.initializeTimeSettings();
    
    // Get current time in Philippines
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const phTime = new Date(utcTime + 3600000 * 8); // UTC+8 for Philippines
    
    const currentHour = phTime.getHours();
    const currentMinute = phTime.getMinutes();
    
    console.log('Current Time (PH):', currentHour + ':' + currentMinute);
    console.log('Store Hours:', userStore.openingHour + ':' + userStore.openingMinute, 
                'to', userStore.closingHour + ':' + userStore.closingMinute);
    
    // Check if current time is within operating hours
    const isBeforeOpening =
      currentHour < userStore.openingHour ||
      (currentHour === userStore.openingHour &&
      currentMinute < userStore.openingMinute);
    
    const isAfterClosing =
      currentHour > userStore.closingHour ||
      (currentHour === userStore.closingHour &&
      currentMinute >= userStore.closingMinute);
    
    const isStoreClosed = isBeforeOpening || isAfterClosing;
    console.log('Store is closed:', isStoreClosed);
    
    if (!isStoreClosed) {
      // Store is open, redirect to homepage
      window.location.href = "/";
    }
  } catch (error) {
    console.error('Error in checkAndRedirect:', error);
  }
};

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
});
</script> 