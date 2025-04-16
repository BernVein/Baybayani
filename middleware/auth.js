import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware(async (from, to) => {
  const user = useSupabaseUser();
  const userStore = useUserStore();

  // Quick check with default values before async operation
  // Get current time in Philippines immediately
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const phTime = new Date(utcTime + 3600000 * 8); // UTC+8 for Philippines

  const currentHour = phTime.getHours();
  const currentMinute = phTime.getMinutes();

  // Default opening/closing hours in case DB call is slow
  const defaultOpeningHour = userStore.openingHour;
  const defaultOpeningMinute = userStore.openingMinute;
  const defaultClosingHour = userStore.closingHour;
  const defaultClosingMinute = userStore.closingMinute;

  // Check if current time is outside operating hours using default values
  const isBeforeOpening =
    currentHour < defaultOpeningHour ||
    (currentHour === defaultOpeningHour &&
      currentMinute < defaultOpeningMinute);

  const isAfterClosing =
    currentHour > defaultClosingHour ||
    (currentHour === defaultClosingHour &&
      currentMinute >= defaultClosingMinute);

  // For testing: Set to true to force closed page
  const forceClosedPage = false;
  const isStoreClosed = isBeforeOpening || isAfterClosing || forceClosedPage;

  // Skip the check for admin routes and login page
  const isAdminRoute = to.fullPath.startsWith("/admin");
  const isLoginPage = to.fullPath === "/login";

  // Fast path: If store is closed and this is not an admin or login page, redirect immediately
  if (
    isStoreClosed &&
    to.fullPath !== "/closed" &&
    !isAdminRoute &&
    !isLoginPage
  ) {
    return navigateTo("/closed");
  }

  // Then load the actual settings (will be used on next navigation)
  await userStore.initializeTimeSettings();

  // Recheck with potentially updated values from database
  const updatedIsBeforeOpening =
    currentHour < userStore.openingHour ||
    (currentHour === userStore.openingHour &&
      currentMinute < userStore.openingMinute);

  const updatedIsAfterClosing =
    currentHour > userStore.closingHour ||
    (currentHour === userStore.closingHour &&
      currentMinute >= userStore.closingMinute);

  const updatedIsStoreClosed = updatedIsBeforeOpening || updatedIsAfterClosing || forceClosedPage;

  // If someone tries to directly access /closed when the store is OPEN, redirect to home
  if (to.fullPath === "/closed" && !updatedIsStoreClosed && !isAdminRoute) {
    return navigateTo("/");
  }

  // Double-check with updated values
  if (
    updatedIsStoreClosed &&
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
