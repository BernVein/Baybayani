export const isStoreClosed = (userStore) => {
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