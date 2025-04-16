<template>
  <AdminLayout>
    <!-- Add Loading component -->
    <Loading v-if="isLoading" />
    
    <div id="SuccessPage" class="mt-4 max-w-[1200px] mx-auto px-2 min-h-[50vh]">
      <!-- Success Message Card -->
      <div class="bg-white rounded-lg shadow-md border border-gray-100 p-8 mb-6">
        <div class="flex justify-center mb-6">
          <div class="bg-green-100 p-4 rounded-full">
            <Icon name="ph:check-circle-fill" class="text-green-600" size="60" />
          </div>
        </div>
        
        <h1 class="text-center text-3xl font-bold text-gray-800 mb-3">Order Successful!</h1>
        <p class="text-center text-gray-600 mb-6">
          Thank you for your order. We are preparing your items for pickup.
        </p>
        
        <!-- Order ID and Date -->
        <div class="flex flex-col items-center mb-6 bg-gray-50 py-4 px-6 rounded-lg">
          <p class="text-gray-600 mb-1">Order ID: <span class="font-semibold text-gray-800">{{ latestOrder?.id || 'Processing...' }}</span></p>
          <p class="text-gray-600">Order Date: <span class="font-semibold text-gray-800">{{ formatDate(latestOrder?.created_at) || 'Processing...' }}</span></p>
        </div>
        
        <!-- Browse More Products Button -->
        <div class="flex justify-center">
          <NuxtLink to="/" class="bg-[#0C6539] hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center">
            <Icon name="ph:shopping-bag" class="mr-2" size="20" />
            Browse More Products
          </NuxtLink>
        </div>
      </div>
      
      <!-- Order Details Card -->
      <div v-if="latestOrder" class="bg-white rounded-lg shadow-md border border-gray-100 p-8 mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Icon name="ph:clipboard-text" class="mr-3 text-[#0C6539]" size="28" />
          Order Details
        </h2>
        
        <!-- Order Items -->
        <div class="mb-8">
          <h3 class="font-semibold text-lg text-gray-800 mb-4">Items Ordered</h3>
          <div class="divide-y">
            <div v-for="(item, index) in latestOrder.orderItem" :key="index" class="py-4 flex justify-between">
              <div class="flex items-center">
                <img :src="item.product.url" alt="Product Image" class="w-16 h-16 object-cover rounded-md mr-4">
                <div>
                  <p class="font-medium text-gray-800">{{ item.product.title }}</p>
                  <p class="text-sm text-gray-600">Quantity: {{ item.quantity }} kg</p>
                </div>
              </div>
              <div class="font-semibold text-gray-800">
                ₱{{ (item.product.price * item.quantity).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Order Summary -->
        <div class="border-t border-gray-200 pt-6">
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">Subtotal</span>
            <span class="font-medium">₱{{ latestOrder.totalPrice.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">Pickup Fee</span>
            <span class="font-medium">₱0.00</span>
          </div>
          <div class="flex justify-between font-bold text-lg border-t border-gray-200 pt-4 mt-4">
            <span>Total</span>
            <span class="text-[#FD374F]">₱{{ latestOrder.totalPrice.toLocaleString() }}</span>
          </div>
        </div>
      </div>
      
      <!-- Pickup Information Card -->
      <div class="bg-white rounded-lg shadow-md border border-gray-100 p-8 mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Icon name="ph:map-pin" class="mr-3 text-[#0C6539]" size="28" />
          Pickup Information
        </h2>
        
        <div class="space-y-4">
          <div class="flex">
            <div class="w-28 text-gray-600">Address:</div>
            <div class="font-medium text-gray-800">Baybay City Public Market</div>
          </div>
          <div class="flex">
            <div class="w-28 text-gray-600">Landmark:</div>
            <div class="font-medium text-gray-800">Beside Bagsakan</div>
          </div>
          <div class="flex">
            <div class="w-28 text-gray-600">Contact:</div>
            <div class="font-medium text-gray-800">09123456789</div>
          </div>
          <div class="flex">
            <div class="w-28 text-gray-600">Status:</div>
            <div class="font-medium">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" 
                    :class="{
                      'bg-yellow-100 text-yellow-800': latestOrder?.orderStatus === 'PENDING',
                      'bg-blue-100 text-blue-800': latestOrder?.orderStatus === 'PROCESSING',
                      'bg-green-100 text-green-800': latestOrder?.orderStatus === 'FULFILLED',
                      'bg-red-100 text-red-800': latestOrder?.orderStatus === 'CANCELED'
                    }">
                {{ latestOrder?.orderStatus || 'PENDING' }}
                <Icon :name="getStatusIcon(latestOrder?.orderStatus)" class="ml-1" size="16" />
              </span>
            </div>
          </div>
        </div>
        
        <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div class="flex items-start">
            <Icon name="ph:info-fill" class="text-blue-500 mr-3 mt-1" size="20" />
            <div>
              <h3 class="font-semibold text-blue-800 mb-1">Important Note</h3>
              <p class="text-sm text-blue-700">
                Please bring a valid ID when picking up your order. Your order status will be updated when it's ready for pickup.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Track Orders Button -->
      <div class="flex justify-center mb-16">
        <NuxtLink to="/orders" class="border border-[#0C6539] text-[#0C6539] hover:bg-[#0C6539] hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center">
          <Icon name="ph:list-checks" class="mr-2" size="20" />
          View All My Orders
        </NuxtLink>
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
const route = useRoute();
const isLoading = ref(true);
const latestOrder = ref(null);

// Function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Function to get status icon based on order status
const getStatusIcon = (status) => {
  switch (status) {
    case 'PENDING':
      return 'ph:clock';
    case 'PROCESSING':
      return 'ph:spinner';
    case 'FULFILLED':
      return 'ph:check-circle';
    case 'CANCELED':
      return 'ph:x-circle';
    default:
      return 'ph:clock';
  }
};

// Fetch the latest order
const fetchLatestOrder = async () => {
  try {
    if (!user.value || !user.value.id) return;
    
    const orders = await $fetch(`/api/prisma/get-all-orders-by-user/${user.value.id}`);
    
    if (orders && orders.length > 0) {
      // Sort by creation date (newest first)
      const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      latestOrder.value = sortedOrders[0];
    }
  } catch (error) {
    console.error('Error fetching latest order:', error);
  } finally {
    isLoading.value = false;
  }
};

// Redirect to the login page if the user is not logged in
watchEffect(() => {
  if (route.fullPath == "/success" && (!user.value || userStore.user?.role === "Admin")) {
    navigateTo("/admin/dashboard");
  }
  else if (route.fullPath == "/success" && !user.value) {
    navigateTo("/login");
  }
});

onMounted(async () => {
  await fetchLatestOrder();
  setTimeout(() => (userStore.isLoading = false), 300);
});
</script>

<style scoped>
/* Optional: Add additional styles for the success page */
.divide-y > div:first-child {
  border-top: none;
}

/* Custom animations */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse 2s infinite;
}
</style>
