import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware((from, to) => {
  const user = useSupabaseUser();
  const userStore = useUserStore();

  // Initialize time settings if needed
  if (userStore.initializeTimeSettings) {
    userStore.initializeTimeSettings();
  }

  // Check if website is closed based on Philippines time (UTC+8)
  // Get current time in Philippines
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const phTime = new Date(utcTime + 3600000 * 8); // UTC+8 for Philippines

  const currentHour = phTime.getHours();
  const currentMinute = phTime.getMinutes();

  // For testing: Set to true to force closed page
  const forceClosedPage = false;

  // Check if current time is outside operating hours
  const isBeforeOpening =
    currentHour < userStore.openingHour ||
    (currentHour === userStore.openingHour &&
      currentMinute < userStore.openingMinute);

  const isAfterClosing =
    currentHour > userStore.closingHour ||
    (currentHour === userStore.closingHour &&
      currentMinute >= userStore.closingMinute);

  const isStoreClosed = isBeforeOpening || isAfterClosing || forceClosedPage;

  // Skip the check for admin routes and login page
  const isAdminRoute = to.fullPath.startsWith("/admin");
  const isLoginPage = to.fullPath === "/login";

  // If someone tries to directly access /closed when the store is OPEN, redirect to home
  if (to.fullPath === "/closed" && !isStoreClosed && !isAdminRoute) {
    return navigateTo("/");
  }

  // If the store is closed and user is trying to access a normal page, redirect to closed
  if (
    isStoreClosed &&
    to.fullPath !== "/closed" &&
    !isAdminRoute &&
    !isLoginPage
  ) {
    return navigateTo("/closed");
  }

  if (!user.value && to.fullPath == "/checkout") {
    // return navigateTo("/auth");
    window.location.href = "/login";
  }
});
