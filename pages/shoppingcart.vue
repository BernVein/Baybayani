<!-- shoppingcart.vue -->
<template>
  <AdminLayout>
    <div id="ShoppingCartPage" class="mt-4 max-w-[1200px] mx-auto px-2">
      <!-- Empty Cart State -->
      <div v-if="!filteredCartItems.length" class="h-[500px] flex items-center justify-center">
        <div class="pt-20 transform transition-all duration-500 hover:scale-105">
          <img class="mx-auto drop-shadow-lg" width="250" src="/baybayani-logo.png" />
          <div class="text-xl text-center mt-6 text-gray-700 font-medium">
            Your shopping cart is empty
          </div>
          <div class="text-center text-gray-500 mt-2">
            Add some products to get started!
          </div>

          <!-- Browse Products Button -->
          <div class="flex justify-center mt-6">
            <NuxtLink to="/"
              class="bg-[#0C6539] text-white text-lg font-semibold px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center">
              <Icon name="ph:storefront" class="mr-2" size="22" />
              Browse Products
            </NuxtLink>
          </div>

          <!-- If not logged, goto login page -->
          <div v-if="!user" class="flex text-center mt-4">
            <div @click="navigateLogin"
              class="bg-[#FD374F] w-full text-white text-lg font-semibold p-2.5 rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center justify-center">
              <Icon name="ph:sign-in" class="mr-2" size="22" />
              Sign in
            </div>
          </div>
        </div>
      </div>

      <!-- Cart with Items -->
      <div v-else>
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-800 flex items-center">
            <Icon name="ph:shopping-cart-simple" size="40" class="mr-3 text-[#0C6539]" />
            Your Shopping Cart
          </h1>
          <p class="text-gray-600 mt-1">Review your items and proceed to checkout</p>
        </div>

        <div class="md:flex gap-6 justify-between mx-auto w-full">
          <!-- Left Column - Cart Items -->
          <div class="md:w-[65%]">
            <div class="bg-white rounded-lg px-3 py-2 lg:py-4 lg:px-5  shadow-sm border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center text-xl font-semibold">
                  <span>Items ({{ filteredCartItems.length }})</span>
                </div>

                <!-- Select All Feature -->
                <div class="flex items-center cursor-pointer group" @click="toggleAllItems">
                  <div class="w-5 h-5 border-2 rounded flex items-center justify-center mr-2"
                    :class="allSelected ? 'border-[#0C6539] bg-[#0C6539]' : 'border-gray-300'">
                    <Icon v-if="allSelected" name="ph:check" class="text-white" />
                  </div>
                  <span class="text-gray-600 group-hover:text-[#0C6539] transition-colors duration-200">
                    {{ allSelected ? 'Deselect All' : 'Select All' }}
                  </span>
                </div>
              </div>

              <!-- Items List with Animation -->
              <div class="divide-y">
                <TransitionGroup name="cart-item">
                  <div v-for="(cartItem, index) in filteredCartItems" :key="cartItem.id"
                    class="py-4 transform transition-all duration-300 hover:bg-gray-50">
                    <CartItem :product="filteredCartItems[index].product" :selectedArray="selectedArray"
                      @selectedRadio="selectedRadioFunc" />
                  </div>
                </TransitionGroup>
              </div>
            </div>
          </div>

          <!-- Right Column - Summary -->
          <div class="md:w-[35%] mt-6 md:mt-0">
            <div class="sticky top-24">
              <!-- Order Summary -->
              <div id="Summary" class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div class="text-2xl font-bold mb-5 text-gray-800">Order Summary</div>

                <div class="space-y-3 mb-5">
                  <div class="flex items-center justify-between text-gray-600">
                    <div>Selected Items:</div>
                    <div>{{ totalItemsCount }}</div>
                  </div>
                  <div class="flex items-center justify-between text-gray-600">
                    <div>Total Weight:</div>
                    <div>{{ totalSelectedWeight }} kg</div>
                  </div>
                </div>

                <div class="border-t border-gray-200 my-4 pt-4"></div>

                <div class="flex items-center justify-between my-2">
                  <div class="font-semibold text-lg text-gray-800">Total</div>
                  <div class="text-2xl font-bold text-[#FD374F]">
                    ₱{{ totalPriceComputed.toLocaleString() }}
                  </div>
                </div>

                <!-- Checkout Button with Animation -->
                <button @click="goToCheckout" :disabled="totalItemsCount === 0"
                  class="flex items-center justify-center bg-[#0C6539] w-full text-white text-xl font-semibold p-3 rounded-lg mt-5 hover:bg-green-700 transition-all duration-300 transform hover:scale-[1.02]"
                  :class="{ 'opacity-50 cursor-not-allowed': totalItemsCount === 0 }">
                  <Icon name="ph:check-circle" size="24" class="mr-2" />
                  Checkout
                </button>

                <!-- Empty selection warning -->
                <div v-if="totalItemsCount === 0" class="mt-3 text-center text-amber-600 text-sm">
                  <Icon name="ph:warning-circle" class="inline mr-1" />
                  Select items to checkout
                </div>
              </div>

              <!-- Shopping Help Card -->
              <div class="bg-blue-50 rounded-lg p-5 mt-4 border border-blue-100">
                <div class="flex items-start">
                  <Icon name="ph:info-fill" class="text-blue-500 mr-3 mt-1" size="20" />
                  <div>
                    <h3 class="font-semibold text-blue-800 mb-1">Pickup Information</h3>
                    <p class="text-sm text-blue-700">
                      Items will be available for pickup at Baybay City Public Market.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from "~/layouts/AdminLayout.vue";
import { useUserStore } from "~/stores/user";
import { ref, computed, watchEffect, onBeforeMount, onMounted } from "vue";

// Store and user refs
const userStore = useUserStore();
const user = useSupabaseUser();
const route = useRoute();
const role = userStore.profile?.role;

// Selected items tracking
let selectedArray = ref([]);
let allSelected = ref(false);

// Toggle all items selection
const toggleAllItems = () => {
  allSelected.value = !allSelected.value;

  if (allSelected.value) {
    // Select all items
    filteredCartItems.value.forEach(item => {
      if (item.product.stock > 0) { // Only select items in stock
        const existingIndex = selectedArray.value.findIndex(selectedItem =>
          selectedItem.id === item.product.id);

        if (existingIndex === -1) {
          selectedArray.value.push({
            id: item.product.id,
            val: true,
            quantity: item.quantity,
            price: item.product.price
          });
        } else {
          selectedArray.value[existingIndex].val = true;
        }
      }
    });
  } else {
    // Deselect all items
    selectedArray.value.forEach(item => {
      item.val = false;
    });
    selectedArray.value = [];
  }
};

// Handle individual item selection
const selectedRadioFunc = (e) => {
  const existingIndex = selectedArray.value.findIndex(item => item.id === e.id);

  if (e.val) {
    // If the item is selected, add it to selectedArray
    if (existingIndex === -1) {
      selectedArray.value.push({ ...e, quantity: e.quantity });
    } else {
      selectedArray.value[existingIndex].quantity = e.quantity;
    }
  } else {
    // If the item is deselected, remove it from selectedArray
    if (existingIndex !== -1) {
      selectedArray.value.splice(existingIndex, 1);
    }
  }

  // Update allSelected state
  updateSelectAllState();
};

const updateSelectAllState = () => {
  // Check if all available items are selected
  const availableItems = filteredCartItems.value.filter(item => item.product.stock > 0);
  allSelected.value = availableItems.length > 0 && availableItems.every(item => {
    return selectedArray.value.some(selectedItem =>
      selectedItem.id === item.product.id && selectedItem.val);
  });
};

// Filter out products that are hidden or deleted
const filteredCartItems = computed(() => {
  return userStore.cartItems?.filter(
    (item) => item.product && !item.product.hidden && !item.product.isDeleted
  ) || [];
});

// Compute total items count
const totalItemsCount = computed(() => {
  return selectedArray.value.reduce((sum, item) => sum + (item.val ? 1 : 0), 0);
});

// Compute total weight of selected items
const totalSelectedWeight = computed(() => {
  return selectedArray.value.reduce(
    (sum, item) => sum + (item.val ? parseFloat(item.quantity) : 0),
    0
  );
});

// Compute total price of selected items
const totalPriceComputed = computed(() => {
  return selectedArray.value.reduce(
    (sum, item) => sum + (item.val ? item.price * item.quantity : 0),
    0
  );
});

// Update selection state when cart items change
watchEffect(() => {
  if (userStore.cartItems && userStore.cartItems.length > 0) {
    updateSelectAllState();
  }
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

// Handle checkout process
const goToCheckout = () => {
  if (selectedArray.value.length === 0 || !filteredCartItems.value.length) {
    return; // Do nothing if no items selected or cart is empty
  }
  window.location.href = `/checkout`;
};

const navigateLogin = () => {
  window.location.href = `/login`;
};

// Initialize time settings and check if store is closed
onMounted(() => {
  userStore.initializeTimeSettings();

  // Check if store is closed and redirect if needed
  if (isStoreClosed() && role !== "Admin") {
    navigateTo("/closed");
  }
});

// Redirect to the login page if the user is not logged in
watchEffect(() => {
  if (route.fullPath == "/shoppingcart" &&
    (!user.value || role === "Admin")) {
    navigateTo("/admin/dashboard");
  }
  else if (route.fullPath == "/shoppingcart" && !user.value) {
    navigateTo("/login");
  }
  // Check if store is closed
  else if (route.fullPath == "/shoppingcart" && isStoreClosed() && role !== "Admin") {
    navigateTo("/closed");
  }
});
</script>

<style scoped>
/* Cart item transition animations */
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.5s ease;
}

.cart-item-enter-from,
.cart-item-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.cart-item-move {
  transition: transform 0.5s ease;
}

/* Custom scrollbar for browsers that support it */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #0C6539;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #094a2a;
}
</style>
