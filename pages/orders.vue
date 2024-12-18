<template>
  <AdminLayout>
    <div id="OrdersPage" class="mt-4 max-w-[1200px] mx-auto px-2 min-h-[50vh]">
      <div class="bg-white w-full p-6 min-h-[150px]">
        <div class="flex items-center text-xl">
          <Icon name="carbon:delivery" size="35" />
          <span class="pl-4 text-2xl font-semibold">Orders</span>
        </div>

        <!-- Dropdown Menu for Sorting -->
        <div class="flex justify-end mb-4 relative" ref="dropdownWrapper">
          <button @click="toggleDropdown" class="bg-gray-200 px-4 py-2 rounded-md flex items-center">
            <span class="mr-2 font-semibold">Filter by Status</span>
            <Icon name="line-md:filter" size="25" />
          </button>

          <!-- Dropdown content -->
          <div v-if="dropdownOpen" class="absolute right-0 mt-2 w-48 bg-white border shadow-md rounded-lg z-10">
            <ul>
              <li>
                <button @click="filterOrders('ALL')" class="w-full text-left px-4 py-2 hover:bg-gray-100">
                  All Orders
                </button>
              </li>
              <li>
                <button @click="filterOrders('PENDING')" class="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Pending
                </button>
              </li>
              <li>
                <button @click="filterOrders('PROCESSING')" class="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Processing
                </button>
              </li>
              <li>
                <button @click="filterOrders('FULFILLED')" class="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Fulfilled
                </button>
              </li>
              <li>
                <button @click="filterOrders('CANCELED')" class="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Canceled
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="orders === null" class="flex items-center justify-center">
          Loading...
        </div>

        <!-- Check if there are orders -->
        <div v-if="orders && filteredOrders.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(order, index) in filteredOrders" :key="order.id"
            class="border-b py-4 relative bg-gray-50 p-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <div class="font-semibold mb-2">Order #{{ order.id }}</div>
                <div :class="['status-indicator', statusClass(order.orderStatus)]"></div>
                <span class="ml-2 text-sm capitalize">{{ order.orderStatus }}</span>
              </div>
            </div>

            <!-- Order Date -->
            <div class="text-sm text-gray-500 mb-2">
              Ordered on: {{ new Date(order.created_at).toLocaleDateString() }}
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                :style="{ width: progressWidth(order.orderStatus), backgroundColor: progressColor(order.orderStatus) }"
                class="h-2.5 rounded-full"></div>
            </div>

            <!-- Order Items -->
            <div v-if="order.orderItem && order.orderItem.length > 0">
              <div v-for="(item, itemIndex) in order.orderItem" :key="item.id"
                class="flex items-center gap-3 p-1 transition-colors hover:bg-green-100">
                <img width="40" :src="item.product.url" alt="Product Image" class="rounded-full" />
                <NuxtLink :to="`/item/${item.productId}`" class="hover:text-green-500 transition-colors duration-300">
                  {{ item.product.title }} - Quantity: {{ item.quantity }} kg
                </NuxtLink>
              </div>
            </div>
            <div v-else class="text-gray-500 italic">
              All products in this order are unavailable.
            </div>

            <!-- Total Price and Cancel Button -->
            <div class="flex justify-between items-center mt-4">


              <!-- Cancel Order button, only visible for PENDING orders -->
              <div v-if="order.orderStatus === 'PENDING'">
                <button @click="showCancelModal(order.id)"
                  class=" text-red-500 font-semibold underline px-4 py-2 rounded-md hover:bg-red-600 hover:text-white transition-colors">
                  Cancel Order
                </button>
              </div>

              <!-- Display Total Price -->
              <div :class="order.orderStatus === 'CANCELED' ? 'text-red-500' : 'text-green-500'"
                class="font-bold text-xl">
                Total: ₱{{ order.totalPrice.toLocaleString() }}
              </div>
            </div>
          </div>
        </div>

        <!-- No orders found -->
        <div v-else class="flex items-center justify-center">
          You have no order history
        </div>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-lg font-semibold mb-4">Confirm Cancellation</h2>
        <p>Are you sure you want to cancel this order?</p>
        <div class="flex justify-end mt-4">
          <button @click="confirmCancel" class="bg-red-500 text-white px-4 py-2 rounded-md mr-2">Yes</button>
          <button @click="closeModal" class="bg-gray-300 px-4 py-2 rounded-md">No</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>


<script setup>
import AdminLayout from "~/layouts/AdminLayout.vue";
import { useUserStore } from "~/stores/user";
import { ref, onBeforeMount, onBeforeUnmount, onMounted, watchEffect } from "vue";
const userStore = useUserStore();
const user = useSupabaseUser();
let orders = ref(null);
let filteredOrders = ref([]);
let selectedOrderId = ref(null);  // Track the selected order for options
let dropdownOpen = ref(false);  // Track dropdown visibility
let showModal = ref(false);  // Track modal visibility
let orderIdToCancel = ref(null);  // Track which order to cancel

// Watch effect to check if the user is logged in
const route = useRoute();
const role = userStore.profile?.role;

watchEffect(() => {
  if (route.fullPath == "/orders" &&
    (!user.value || role === "Admin")) {
    navigateTo("/admin/dashboard");
  }
  else if (route.fullPath == "/orders" && !user.value) {
    navigateTo("/login");
  }
});

// Handle clicks outside the dropdown to close it
const closeDropdown = (event) => {
  const dropdown = document.querySelector("[ref='dropdownWrapper']");
  if (dropdown && !dropdown.contains(event.target)) {
    dropdownOpen.value = false;
  }
};

// Handle clicks outside the cancel dropdown to close it
const closeCancelDropdown = (event) => {
  const cancelDropdown = document.getElementById('cancelDropdown-' + selectedOrderId.value);
  if (cancelDropdown && !cancelDropdown.contains(event.target)) {
    selectedOrderId.value = null;  // Close the cancel dropdown when clicking outside
  }
};

// Add event listener on mount and remove on unmount
onMounted(() => {
  document.addEventListener('click', closeDropdown);
  document.addEventListener('click', closeCancelDropdown);  // Close cancel dropdown when clicking outside
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown);
  document.removeEventListener('click', closeCancelDropdown);  // Remove cancel dropdown listener
});

onBeforeMount(async () => {
  try {
    //await userStore.fetchOrders();

    // Fetch the orders based on user ID
    orders.value = await useFetch(`/api/prisma/get-all-orders-by-user/${user.value.id}`);

    if (!orders.value.data) {
      throw new Error("Failed to load orders");
    }

    // Initially, show all orders
    filteredOrders.value = orders.value.data;

    // Sort orders by `createdAt` in descending order (most recent first)
    filteredOrders.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
});

const filterOrders = (status) => {
  dropdownOpen.value = false;  // Close dropdown after selection
  if (status === 'ALL') {
    filteredOrders.value = orders.value.data;
  } else {
    filteredOrders.value = orders.value.data.filter(order => order.orderStatus === status);
  }
};

// Toggle dropdown visibility
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

// Toggle order options (show cancel option for pending orders)
const toggleOrderOptions = (orderId) => {
  selectedOrderId.value = selectedOrderId.value === orderId ? null : orderId;
};

// Show cancel confirmation modal
const showCancelModal = (orderId) => {
  orderIdToCancel.value = orderId;
  showModal.value = true;
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  orderIdToCancel.value = null;
};

// Confirm cancellation
const confirmCancel = async () => {
  try {
    // Send DELETE request to cancel the order
    await useFetch(`/api/prisma/cancel-order/${orderIdToCancel.value}`, { method: "DELETE" });

    // Find the order in the orders list and update its status to "CANCELED"
    const orderToCancel = orders.value.data.find(order => order.id === orderIdToCancel.value);

    if (orderToCancel) {
      // Update the order status to 'CANCELED'
      orderToCancel.orderStatus = 'CANCELED';
      // Refresh the orders list
      await userStore.fetchOrders();
    } else {
      console.error("Order not found in orders list.");
    }
  } catch (error) {
    console.error("Error canceling order:", error);
  } finally {
    closeModal();  // Ensure modal closes after confirmation
  }
};

// Status color classes
const statusClass = (status) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-400";
    case "PROCESSING":
      return "bg-blue-400";
    case "FULFILLED":
      return "bg-green-400";
    case "CANCELED":
      return "bg-red-400";
    default:
      return "bg-gray-200";
  }
};

// Progress bar width based on order status
const progressWidth = (status) => {
  switch (status) {
    case "PENDING":
      return "25%";
    case "PROCESSING":
      return "50%";
    case "FULFILLED":
      return "100%";
    case "CANCELED":
      return "100%";
    default:
      return "0%";
  }
};

// Progress bar color based on order status
const progressColor = (status) => {
  switch (status) {
    case "PENDING":
      return "#fbbf24"; // Yellow
    case "PROCESSING":
      return "#3b82f6"; // Blue
    case "FULFILLED":
      return "#10b981"; // Green
    case "CANCELED":
      return "#ef4444"; // Red
    default:
      return "#e5e7eb"; // Gray
  }
};
</script>

<style scoped>
/* Ensure the status indicators are always circular */
.status-indicator {
  width: 14px;
  /* Fixed width */
  height: 14px;
  /* Fixed height */
  border-radius: 50%;
  /* Make it a circle */
  display: inline-block;
  /* Ensure it stays inline */
  flex-shrink: 0;
  /* Prevent shrinking */
}

/* Example status colors */
.bg-yellow-400 {
  background-color: #fbbf24;
  /* Yellow */
}

.bg-blue-400 {
  background-color: #3b82f6;
  /* Blue */
}

.bg-green-400 {
  background-color: #10b981;
  /* Green */
}

.bg-red-400 {
  background-color: #ef4444;
  /* Red */
}
</style>
