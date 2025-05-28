<template>
  <AdminLayout>
    <!-- Add Loading component -->
    <Loading v-if="isLoading" />
    
    <div id="CheckoutPage" class="mt-4 max-w-[1200px] mx-auto px-2">
      <!-- Page Header -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800 flex items-center">
          <Icon name="ph:check-circle" size="38" class="mr-3 text-[#0C6539]" />
          Checkout
        </h1>
        <p class="text-gray-600 mt-1">Review your order and confirm</p>
      </div>
      
      <div class="md:flex gap-6 justify-between mx-auto w-full">
        <!-- Left Column -->
        <div class="md:w-[65%]">
          <!-- Pickup Information Card -->
          <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100 transform transition-all duration-300 hover:shadow-md">
            <div class="flex items-center mb-4">
              <Icon name="ph:map-pin" size="24" class="text-[#0C6539] mr-3" />
              <div class="text-xl font-semibold">Pickup Information</div>
            </div>
            <div class="pt-2 border-t">
              <div class="space-y-4 mt-3">
                <div class="flex items-center">
                  <div class="w-24 text-gray-600">Address:</div>
                  <div class="font-medium">Baybay City Public Market</div>
                </div>
                <div class="flex items-center">
                  <div class="w-24 text-gray-600">Landmark:</div>
                  <div class="font-medium">Beside Bagsakan</div>
                </div>
                <div class="flex items-center">
                  <div class="w-24 text-gray-600">Contact:</div>
                  <div class="font-medium">09123456789</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Order Items -->
          <div class="bg-white rounded-lg p-6 mt-6 shadow-sm border border-gray-100">
            <div class="flex items-center mb-4">
              <Icon name="ph:shopping-bag" size="24" class="text-[#0C6539] mr-3" />
              <div class="text-xl font-semibold">Order Items</div>
            </div>
            
            <!-- Order Items List -->
            <div class="divide-y">
              <TransitionGroup name="checkout-item">
                <div v-for="(cartItem, index) in userStore.checkout" :key="cartItem.id" 
                    class="py-4 transform transition-all duration-300 hover:bg-gray-50">
                  <!-- Use the index to find the specific cartItem in the checkout array -->
                  <CheckoutItem :product="userStore.checkout[index]" />
                </div>
              </TransitionGroup>
            </div>
            
            <!-- Back to Cart Button -->
            <div class="mt-6 flex justify-center">
              <a href="/shoppingcart" class="flex items-center text-[#0C6539] hover:text-green-700 transition-colors font-medium">
                <Icon name="ph:arrow-left" class="mr-2" />
                Back to Cart
              </a>
            </div>
          </div>
        </div>

        <!-- Right Column - Order Summary -->
        <div class="md:w-[35%] mt-6 md:mt-0">
          <div class="sticky top-24">
            <div id="PlaceOrder" class="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div class="flex items-center mb-4">
                <Icon name="ph:receipt" size="24" class="text-[#0C6539] mr-3" />
                <div class="text-xl font-bold text-gray-800">Order Summary</div>
              </div>

              <div class="border-t border-gray-200 pt-4 mt-2">
                <!-- Order Details -->
                <div class="space-y-3 mb-4">
                  <div v-for="(item, index) in userStore.checkout" :key="index" class="flex justify-between text-sm">
                    <div class="text-gray-600 truncate max-w-[60%]">{{ item.product.title }}</div>
                    <div class="font-medium">₱{{ (item.product.price * item.quantity).toLocaleString() }}</div>
                  </div>
                </div>
                
                <div class="border-t border-dashed border-gray-200 my-4"></div>
                
                <!-- Total Section -->
                <div class="flex items-center justify-between mb-6">
                  <div class="font-semibold text-lg text-gray-800">Total</div>
                  <div class="text-2xl font-bold text-[#FD374F]">
                    ₱{{ total.toLocaleString() }}
                  </div>
                </div>

                <!-- Confirm Order Button -->
                <button @click="placeOrder" :disabled="isLoading"
                  class="flex items-center justify-center bg-[#0C6539] w-full text-white text-xl font-semibold p-3 rounded-lg transition-all duration-300 transform hover:bg-green-700 hover:scale-[1.02]"
                  :class="{ 'opacity-75 cursor-not-allowed': isLoading }">
                  <Icon name="ph:check-circle" size="24" class="mr-2" />
                  Confirm Order
                </button>
              </div>
            </div>
            
            <!-- Notes Card -->
            <div class="bg-amber-50 rounded-lg p-5 mt-4 border border-amber-100">
              <div class="flex items-start">
                <Icon name="ph:info-fill" class="text-amber-500 mr-3 mt-1" size="20" />
                <div>
                  <h3 class="font-semibold text-amber-800 mb-1">Important Note</h3>
                  <p class="text-sm text-amber-700">
                    Once your order is confirmed, you'll receive a confirmation. Please bring a valid ID for pickup.
                  </p>
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
import Loading from "~/components/Loading.vue";

const userStore = useUserStore();
const user = useSupabaseUser();
const isLoading = ref(false);

//definePageMeta({ middleware: "auth" });

let total = ref(0);


const route = useRoute();
const role = userStore.profile?.role;
watchEffect(() => {
  if (route.fullPath == "/checkout" && 
      (!user.value || userStore.isAdmin())) {
    navigateTo("/login");
  }
  // Check if store is closed - only affect buyers
  else if (route.fullPath == "/checkout" && 
      isStoreClosed() && !userStore.isAdmin() && !userStore.isClient()) {
    navigateTo("/closed");
  }
});



onMounted(() => {
  if (route.fullPath == "/checkout" && !user.value) {
    //navigateTo("/login");
    window.location.href = "/login";
  }
  // else if (route.fullPath == "/checkout" && userStore.checkout.length === 0) {
  //   //navigateTo("/shoppingcart");
  //   window.location.href = "/shoppingcart";
  // }

  userStore.cartItems.forEach((item) => {
    if (item.checked === true) {
      // Push checked items into userStore.checkout
      userStore.checkout.push(item);
    }
  });

  userStore.checkout.forEach((item) => {
    total.value += item.product.price * item.quantity;
  });

});

const removeOrderedItems = (checkout) => {
  const checkoutData = userStore.checkout.map((item) => item.product.id); // Get the list of product IDs in the current checkout
  return checkout.filter((item) => !checkoutData.includes(item.product.id)); // Filter out the ordered items
};

const placeOrder = async () => {
  try {
    // Set loading state to true
    isLoading.value = true;
    
    // Call createOrder to send the order to the backend
    await createOrder();

    // Add a slight delay before redirecting
    setTimeout(() => {
      userStore.checkout = removeOrderedItems(userStore.checkout);
      userStore.checkout = []; // Clear the checkout items
      userStore.refreshFlag = 1;
      userStore.fetchCartItems();
      userStore.fetchOrders();
      
      // Redirect to success page
      window.location.href = "/success";
    }, 800);
  } catch (error) {
    console.error("Error placing the order:", error);
    isLoading.value = false; // Reset loading state if there's an error
  }
};

const createOrder = async () => {
  try {
    const checkoutData = userStore.checkout.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    // Send the request to the backend to create the order
    await $fetch("/api/prisma/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Ensure correct header
      },
      body: {
        userId: user.value.id,
        checkoutItem: checkoutData,
      },
    });
  } catch (error) {
    console.error("Error creating the order:", error);
    throw error; // Re-throw to handle in the placeOrder function
  }
};
</script>

<style scoped>
/* Checkout item transition animations */
.checkout-item-enter-active,
.checkout-item-leave-active {
  transition: all 0.5s ease;
}

.checkout-item-enter-from,
.checkout-item-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.checkout-item-move {
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
