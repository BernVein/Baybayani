<template>
  <div class="flex h-screen">
    <!-- Sidebar Layout -->
    <SideBarLayout class="sidebar" />

    <!-- Admin Layout -->
    <AdminLayout class="admin-layout">
      <div class="main-content flex-1 overflow-y-auto p-6">
        <!-- Title -->
        <h1 class="text-3xl font-semibold mb-8">Order Summary</h1>

        <!-- Loading and Error States -->
        <div v-if="isLoading" class="text-center py-6">
          <p>Loading orders...</p>
        </div>
        <div v-if="errorMessage" class="text-center text-red-500 py-4">
          {{ errorMessage }}
        </div>

        <!-- Order Summary Cards -->
        <div
          v-if="!isLoading && !errorMessage"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-red-600">
            <p class="text-lg font-medium">Total Orders</p>
            <p class="text-4xl font-bold">{{ totalOrders }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-green-600">
            <p class="text-lg font-medium">Pending Orders</p>
            <p class="text-4xl font-bold">{{ pendingOrders }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-blue-600">
            <p class="text-lg font-medium">Cancelled Orders</p>
            <p class="text-4xl font-bold">{{ cancelledOrders }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-yellow-600">
            <p class="text-lg font-medium">Order Success Rate</p>
            <p class="text-4xl font-bold">{{ orderSuccessRate }}%</p>
          </div>
        </div>

        <!-- Recent Orders Section -->
        <div v-if="!isLoading && !errorMessage" class="mb-8">
          <h1 class="text-2xl font-semibold mb-6">Recent Orders</h1>
          <div class="flex justify-between items-center mb-4 relative">
            <!-- Search Input with Icon -->
            <div class="relative w-[350px]">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search for an order"
                class="w-full p-3 border border-gray-300 rounded-md"
              />
              <Icon
                name="ph:magnifying-glass"
                size="20"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>

            <!-- Filter Button with Dropdown -->
            <div class="relative">
              <button
                @click="toggleFilter"
                class="px-4 py-2 border border-gray-400 text-gray-600 rounded-md hover:bg-gray-100 flex items-center space-x-2"
              >
                <Icon name="ph:sliders" size="20" />
                <span>Filter</span>
              </button>
              <div
                v-if="isFilterVisible"
                class="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-md shadow-md p-4 w-48"
              >
                <label class="block mb-2 font-medium text-gray-700">Filter by Status:</label>
                <select v-model="filterStatus" class="w-full p-2 border border-gray-300 rounded-md">
                  <option value="">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="FULFILLED">Fulfilled</option>
                  <option value="CANCELED">Canceled</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Orders Table -->
          <div class="overflow-x-auto bg-white border border-gray-300 rounded-md shadow-sm">
            <table class="w-full table-auto">
              <thead class="bg-gray-100">
                <tr>
                  <th class="py-3 px-4 text-left font-semibold text-gray-700">Order ID</th>
                  <th class="py-3 px-4 text-left font-semibold text-gray-700">Date</th>
                  <th class="py-3 px-4 text-left font-semibold text-gray-700">Customer Name</th>
                  <th class="py-3 px-4 text-left font-semibold text-gray-700">Total</th>
                  <th class="py-3 px-4 text-center font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="order in filteredOrders"
                  :key="order.id"
                  class="hover:bg-gray-200 hover:scale-105 transition transform duration-200 ease-in-out"
                >

                  <td class="py-4 px-4 border-b">{{ order.id }}</td>
                  <td class="py-4 px-4 border-b">{{ order.date }}</td>
                  <td class="py-4 px-4 border-b">{{ order.userName }}</td> <!-- Display userId -->
                  <td class="py-4 px-4 border-b">&#8369;{{ order.totalPrice.toFixed(2) }}</td>
                  <td class="py-4 px-4 border-b text-center">
                    <select
                      v-model="order.orderStatus"
                      @change="updateOrderStatus(order.id, order.orderStatus)"
                      class="px-3 py-1 rounded-full text-white"
                      :class="{
                        'bg-yellow-500': order.orderStatus === 'PENDING',
                        'bg-blue-500': order.orderStatus === 'PROCESSING',
                        'bg-green-500': order.orderStatus === 'FULFILLED',
                        'bg-red-500': order.orderStatus === 'CANCELED',
                      }"
                      
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="FULFILLED">Fulfilled</option>
                      <option value="CANCELED">Canceled</option>
                    </select>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from "vue";
import AdminLayout from "~/layouts/AdminLayout.vue";
import SideBarLayout from "~/layouts/SideBarLayout.vue";

import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const user = useSupabaseUser();
const route = useRoute();

await userStore.isAdmin();

const orders = ref([]); // Dynamic orders array
const isLoading = ref(false); // Loading state
const errorMessage = ref(""); // Error message

// Fetch orders from the API
const fetchOrders = async () => {
  isLoading.value = true; // Show loading indicator
  errorMessage.value = ""; // Clear previous errors

  try {
    // Fetch orders from the API
    const response = await $fetch("/api/prisma/get-all-orders");
    // Map the response to include a human-readable date
    orders.value = await Promise.all(
    response.map(async (order) => {
      const userName = await fetchUserName(order.userId); // Resolve user name
      return {
        ...order,
        userName, // Add userName to the order object
        date: new Date(order.created_at).toLocaleDateString(), // Format the date
      };
    })
  );

  } catch (error) {
    errorMessage.value = "Failed to fetch orders. Please try again later.";
    console.error("Error fetching orders:", error);
  } finally {
    isLoading.value = false; // Hide loading indicator
  }
};

const fetchUserName = async (userId) => {
  try {
    const user = await $fetch(`/api/prisma/get-user/${userId}`); // Fetch user details from API
    return user?.name || "Unknown User"; // Return user's name or fallback
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    return "Unknown User"; // Fallback in case of error
  }
};


// Computed properties for stats
const totalOrders = computed(() => orders.value.length);
const pendingOrders = computed(
  () => orders.value.filter((order) => order.orderStatus === "PENDING").length
);
const cancelledOrders = computed(
  () => orders.value.filter((order) => order.orderStatus === "CANCELED").length
);
const fulfilledOrders = computed(
  () => orders.value.filter((order) => order.orderStatus === "FULFILLED").length
);
const orderSuccessRate = computed(() => {
  const completed = orders.value.filter((order) => order.orderStatus === "FULFILLED").length;
  return orders.value.length > 0 ? ((completed / orders.value.length) * 100).toFixed(2) : 0;
});

// Search and Filter functionality
const searchQuery = ref("");
const filterStatus = ref("");
const isFilterVisible = ref(false);

const filteredOrders = computed(() => {
  let filtered = orders.value;

  // Filter by search query
  if (searchQuery.value !== "") {
    filtered = filtered.filter(
      (order) =>
        order.userId.toLowerCase().includes(searchQuery.value.toLowerCase()) || // Search by user ID
        order.id.toLowerCase().includes(searchQuery.value.toLowerCase()) // Search by order ID
    );
  }

  // Filter by order status
  if (filterStatus.value !== "") {
    filtered = filtered.filter((order) => order.orderStatus === filterStatus.value);
  }

  return filtered;
});

// Toggle filter visibility
const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value;
};

// Fetch data when the component is mounted
onMounted(fetchOrders);
</script>


<style scoped>
.main-content {
  padding-top: 100px;
}

.button:hover .group-hover\:text-white {
  color: white;
}
</style>
