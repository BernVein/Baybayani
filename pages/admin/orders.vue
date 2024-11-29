<template>
  <div class="flex h-screen">
    <!-- Sidebar Layout -->
    <SideBarLayout class="sidebar" />

    <!-- Admin Layout -->
    <AdminLayout class="admin-layout">
      <div class="main-content flex-1 overflow-y-auto p-6">
        <!-- Title -->
        <h1 class="text-3xl font-semibold mb-8">Order Summary</h1>

        <!-- Remove the old loading text and add Loading component -->
        <Loading v-if="isLoading" />

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
                placeholder="Search: Order ID / Date / Customer Name"
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
                class="absolute bottom-full mb-2 right-0 bg-white border border-gray-300 rounded-md shadow-md p-4 w-48"
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
                  v-for="order in paginatedOrders"
                  :key="order.id"
                  class="hover:bg-gray-200 cursor-pointer transition transform duration-200 ease-in-out hover:scale-[1.02]"
                  @click="showOrderProducts(order)"
                >
                  <td class="py-4 px-4 border-b">{{ order.id }}</td>
                  <td class="py-4 px-4 border-b">{{ order.date }}</td>
                  <td class="py-4 px-4 border-b">{{ order.userName }}</td>
                  <td class="py-4 px-4 border-b">&#8369;{{ formatCurrency(order.totalPrice) }}</td>
                  <td class="py-4 px-4 border-b text-center">
                    <select
                      v-model="order.orderStatus"
                      @click.stop
                      @change="updateOrderStatusByUser(order.id, order.orderStatus)"
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

            <!-- Pagination Controls -->
            <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
              <!-- Items per page selector -->
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-700">Show</span>
                <select 
                  v-model="itemsPerPage" 
                  class="border rounded px-2 py-1 text-sm"
                  @change="currentPage = 1"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span class="text-sm text-gray-700">entries</span>
              </div>

              <!-- Page information -->
              <div class="text-sm text-gray-700">
                Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalItems }} entries
              </div>

              <!-- Pagination buttons -->
              <div class="flex gap-2">
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="px-3 py-1 rounded border"
                  :class="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'"
                >
                  Previous
                </button>
                
                <div class="flex gap-1">
                  <button
                    v-for="page in displayedPages"
                    :key="page"
                    @click="currentPage = page"
                    class="px-3 py-1 rounded border"
                    :class="currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'"
                  >
                    {{ page }}
                  </button>
                </div>

                <button
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 rounded border"
                  :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>

    <!-- Modal -->
    <div
      v-if="isModalVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white w-1/3 rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-4">
          Orders of {{ selectedOrder.userName }} on {{ selectedOrder.date }}
        </h2>

        <div>
          <template v-if="selectedOrder.orderItem.length > 0">
            <ul>
              <li
                v-for="product in selectedOrder.orderItem"
                :key="product.id"
                class="flex justify-between items-center py-2 border-b"
              >
                <div class="flex items-center space-x-4">
                  <!-- Product Image -->
                  <img
                    :src="product.product.url"
                    alt="Product Image"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                  <!-- Product Name and Price -->
                  <div>
                    <p class="text-lg font-medium">{{ product.product.title }}</p>
                    <p class="text-sm text-gray-500">Price: &#8369;{{ product.product.price }}</p>
                  </div>
                </div>
                <button
                  @click="deleteProduct(product.id)"
                  class="text-red-500 hover:text-red-700"
                >
                  Unavailable
                </button>
              </li>
            </ul>
          </template>
          <template v-else>
            <div class="text-center py-4">
              <p class="text-lg font-medium text-gray-700">No products available in this order because all the products listed here was unavailable.</p>
            </div>
          </template>
        </div>

        <button
          @click="closeModal"
          class="mt-6 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import AdminLayout from "~/layouts/AdminLayout.vue";
import SideBarLayout from "~/layouts/SideBarLayout.vue";
import Loading from '~/components/Loading.vue';
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
await userStore.isAdmin();

const orders = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const isModalVisible = ref(false);
const selectedOrder = ref(null);

// Add these refs for pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Fetch orders from the API
const fetchOrders = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await $fetch("/api/prisma/get-all-orders");
    orders.value = await Promise.all(
      response.map(async (order) => {
        const userName = await fetchUserName(order.userId);
        return {
          ...order,
          userName,
          date: new Date(order.created_at).toLocaleDateString(),
        };
      })
    );
  } catch (error) {
    errorMessage.value = "Failed to fetch orders. Please try again later.";
    console.error("Error fetching orders:", error);
  } finally {
    isLoading.value = false;
  }
};


// Fetch user name
const fetchUserName = async (userId) => {
  try {
    const user = await $fetch(`/api/prisma/get-user/${userId}`);

    // If user is not found or role is null, redirect to login
    if (!user || !user.role) {
      alert("Your session is invalid. Please log in again.");
      navigateTo("/login");
      return null; // Return null as the user is redirected
    }

    return user.name || "Unknown User";
  } catch (error) {
    console.error("Error fetching user:", error);
    navigateTo("/login"); // Redirect to login on error
    return null;
  }
};


const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Show modal
const showOrderProducts = (order) => {
  selectedOrder.value = order;
  isModalVisible.value = true;
};

// Close modal
const closeModal = () => {
  isModalVisible.value = false;
  selectedOrder.value = null;
};

// Delete product
// Delete product with confirmation
const deleteProduct = async (productId) => {
  const confirmation = confirm("Are you sure you want to remove this item? This action cannot be undone.");
  if (!confirmation) return;

  isLoading.value = true;
  try {
    const response = await $fetch(`/api/prisma/delete-order-item-by-id/${productId}`, {
      method: "DELETE",
    });

    if (response.success) {
      selectedOrder.value.orderItem = selectedOrder.value.orderItem.filter(
        (item) => item.id !== productId
      );
    } else {
      throw new Error(response.message || "Failed to remove product.");
    }
  } catch (error) {
    console.error("Error removing product:", error);
  } finally {
    isLoading.value = false;
  }
};


const updateOrderStatusByUser = async (orderId, newStatus) => {
  isLoading.value = true;
  try {
    const response = await $fetch(`/api/prisma/update-orderstatus-by-user/${orderId}`, {
      method: "POST",
      body: { orderId, newStatus },
    });

    if (response.success) {
      console.log(`Order ${orderId} status updated to ${newStatus}`);
      const updatedOrder = orders.value.find((order) => order.id === orderId);
      if (updatedOrder) {
        updatedOrder.orderStatus = newStatus;
      }
    } else {
      console.error("Update failed:", response.message);
    }
  } catch (error) {
    console.error("Error updating order status:", error);
  } finally {
    isLoading.value = false;
  }
};


// Computed properties
const totalOrders = computed(() => orders.value.length);
const pendingOrders = computed(() => orders.value.filter((o) => o.orderStatus === "PENDING").length);
const cancelledOrders = computed(
  () => orders.value.filter((o) => o.orderStatus === "CANCELED").length
);
const fulfilledOrders = computed(
  () => orders.value.filter((o) => o.orderStatus === "FULFILLED").length
);
const orderSuccessRate = computed(() => {
  const fulfilled = fulfilledOrders.value;
  return orders.value.length > 0 ? ((fulfilled / orders.value.length) * 100).toFixed(2) : 0;
});

const searchQuery = ref("");
const filterStatus = ref("");
const isFilterVisible = ref(false);

const filteredOrders = computed(() => {
  let filtered = orders.value;

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter((order) => {
      // Check if the search query matches userName, order ID, total price, or date
      return (
        order.userName.toLowerCase().includes(searchQuery.value.toLowerCase()) || // Search by user name
        order.id.toLowerCase().includes(searchQuery.value.toLowerCase()) || // Search by order ID
        order.totalPrice.toString().includes(searchQuery.value) || // Search by total price
        order.date.includes(searchQuery.value) // Search by date (e.g., "11/29/2024")
      );
    });
  }

  // Filter by order status
  if (filterStatus.value) {
    filtered = filtered.filter((order) => order.orderStatus === filterStatus.value);
  }

  return filtered;
});


const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value;
};

// Add these computed properties for pagination
const totalItems = computed(() => filteredOrders.value.length);

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);

const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value));

const paginatedOrders = computed(() => {
  return filteredOrders.value.slice(startIndex.value, endIndex.value);
});

// Add this computed property to handle page number display
const displayedPages = computed(() => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages.value; i++) {
    if (
      i === 1 ||
      i === totalPages.value ||
      (i >= currentPage.value - delta && i <= currentPage.value + delta)
    ) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});

// Watch for filter changes to reset pagination
watch([searchQuery, filterStatus], () => {
  currentPage.value = 1;
});

onMounted(fetchOrders);
</script>

<style scoped>
.main-content {
  padding-top: 100px;
}

.button:hover .group-hover\:text-white {
  color: white;
}

/* Add these styles for pagination */
.pagination-button {
  @apply px-3 py-1 rounded border;
}

.pagination-button:disabled {
  @apply bg-gray-100 text-gray-400 cursor-not-allowed;
}

.pagination-button:not(:disabled):hover {
  @apply bg-gray-100;
}

.pagination-button.active {
  @apply bg-blue-500 text-white;
}
</style>
