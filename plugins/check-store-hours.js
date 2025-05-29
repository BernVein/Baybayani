// Plugin to check store hours on every page navigation
export default defineNuxtPlugin((nuxtApp) => {
  // Add a global afterEach hook for navigation
  nuxtApp.hook('page:finish', () => {
    // Run this check on every page navigation
    checkStoreHours();
  });
  
  // Also check on initial page load
  checkStoreHours();
  
  // Global function to check store hours and redirect if needed
  function checkStoreHours() {
    try {
      // Get userStore to access opening/closing hours
      const { $pinia } = useNuxtApp();
      if (!$pinia) return;
      
      const userStore = $pinia._s.get('user');
      if (!userStore) return;
      
      // Skip check if the user is already on the closed page
      const { currentRoute } = useRouter();
      if (currentRoute.value.path === '/closed') return;
      
      // Skip the check for admin routes and login page
      if (
        currentRoute.value.path.startsWith('/admin') || 
        currentRoute.value.path === '/login'
      ) return;

      // Skip check for admin and client users
      const role = userStore.profile?.role?.toUpperCase();
      if (role === "ADMIN" || role === "CLIENT") return;
      
      // Get current time in Philippines
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const phTime = new Date(utcTime + 3600000 * 8); // UTC+8 for Philippines
      
      const currentHour = phTime.getHours();
      const currentMinute = phTime.getMinutes();
      
      // Check if current time is outside operating hours
      const isBeforeOpening =
        currentHour < userStore.openingHour ||
        (currentHour === userStore.openingHour &&
          currentMinute < userStore.openingMinute);
      
      const isAfterClosing =
        currentHour > userStore.closingHour ||
        (currentHour === userStore.closingHour &&
          currentMinute >= userStore.closingMinute);
      
      const isStoreClosed = isBeforeOpening || isAfterClosing;
      
      // If store is closed and user is a buyer, redirect to closed
      if (isStoreClosed && role === "BUYER") {
        navigateTo('/closed');
      }
    } catch (error) {
      console.error('Error checking store hours:', error);
    }
  }
}); 