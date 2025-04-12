<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-6">
    <div class="bg-white p-5 sm:p-8 rounded-lg shadow-md w-full max-w-md text-center">
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
import { useUserStore } from '~/stores/user';
const userStore = useUserStore();
const user = useSupabaseUser(); // This is globally available in Nuxt without import
const currentTime = ref('');

// Logout function
const logout = async () => {
  await userStore.logout();
  window.location.href = "/login";
};

// Update current time every second
const updateTime = () => {
  // Get current time in Philippines (UTC+8)
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const phTime = new Date(utcTime + (3600000 * 8)); // UTC+8 for Philippines
  
  currentTime.value = phTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

onMounted(() => {
  updateTime();
  setInterval(updateTime, 1000);
  
  // Initialize time settings if not already done
  userStore.initializeTimeSettings();
});
</script> 