<template>
  <div class="fixed z-[-1] bg-[#F2F2F2] w-full h-[100vh]"/>
  <NuxtPage />

  <MenuOverlay
    :class="[
        {'max-h-[100vh] transition-all duration-200 ease-in visible': userStore.isMenuOverlay },
        {'max-h-0 transition-all duration-200 ease-out invisible': !userStore.isMenuOverlay },
    ]"
  />
  
  <!-- Toast Notifications -->
  <div class="fixed top-4 right-4 z-50">
    <div v-for="toast in toasts" :key="toast.id"
      class="mb-2 p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in" 
      :class="{
        'bg-green-500 text-white': toast.type === 'success',
        'bg-red-500 text-white': toast.type === 'error',
        'bg-yellow-500 text-white': toast.type === 'warning',
        'bg-blue-500 text-white': toast.type === 'info'
      }">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '~/stores/user';
const userStore = useUserStore()

const route = useRoute()
const toasts = ref([]);

// if (userStore.user.role === 'Admin') {
//   console.log('User is an Admin');
// } else if (userStore.user.role === 'User') {
//   console.log('User is a regular user');
// } else {
//   console.log('User has an unknown role');
// }


let windowWidth = ref(process.client ? window.innerWidth : '')
const user = useSupabaseUser();

// Function to check if store is closed
const isStoreClosed = () => {
  if (!userStore.openingHour) userStore.initializeTimeSettings();
  
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

// Add toast function
const showToast = (message, type = 'info') => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 4000);
};

// Check if user should be redirected to the closed page
const checkStoreClosed = () => {
  const isAdminRoute = route.fullPath.startsWith('/admin');
  const isLoginPage = route.fullPath === "/login";
  const isClosedPage = route.fullPath === "/closed";
  const role = userStore.profile?.role;
  
  // Only redirect regular users, not admins, and not on admin/login/closed pages
  if (isStoreClosed() && !isAdminRoute && !isLoginPage && !isClosedPage && role !== "Admin") {
    showToast(`The store is now closed. Operating hours: ${userStore.formattedOpeningTime()} - ${userStore.formattedClosingTime()} PHT`, "warning");
    navigateTo("/closed");
  }
};

onMounted(() => {
  userStore.isLoading = true
  
  // Check and restore session if needed
  userStore.checkAndRestoreSession().then(hasSession => {
    if (hasSession) {
      // Session restored successfully
      console.log("Session restored successfully");
    }
  });

  // Initialize time settings
  userStore.initializeTimeSettings();
  
  // Set up periodic check for store hours (every minute)
  const intervalId = setInterval(checkStoreClosed, 60000);
  
  // Clean up interval on component unmount
  onUnmounted(() => {
    clearInterval(intervalId);
  });
  
  // Initial check
  checkStoreClosed();
  
  window.addEventListener('resize', function () {
    windowWidth.value = window.innerWidth;
  });
})

watch(() => windowWidth.value, () => {
    if (windowWidth.value >= 767) {
        userStore.isMenuOverlay = false
    }
})

watch(() => route.fullPath, () => {
    userStore.isLoading = true
})
</script>

<style>
/* Toast animation styles */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
</style>
