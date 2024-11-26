<template>
  <div class="flex h-screen">
    <!-- Sidebar Layout -->
    <SideBarLayout class="sidebar" />

    <!-- Admin Layout -->
    <AdminLayout class="admin-layout">
      <div class="main-content flex-1 overflow-y-auto p-6">
        <!-- Title -->
        <h1 class="text-3xl font-semibold mb-8">Order Summary</h1>

        <!-- Order Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div class="mb-8">
          <h1 class="text-2xl font-semibold mb-6">Recent Orders</h1>
          <div class="flex justify-between items-center mb-4 relative">
            <!-- Search Input with Icon -->
            <div class="relative w-[350px]">
              <input v-model="searchQuery" @keydown.enter="searchOrders" type="text" placeholder="Search for an order"
                class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600" />
              <Icon name="ph:magnifying-glass" size="20"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <!-- Filter Button with Dropdown -->
            <div class="relative">
              <button @click="toggleFilter"
                class="px-4 py-2 border border-gray-400 text-gray-600 rounded-md hover:bg-gray-100 flex items-center space-x-2">
                <Icon name="ph:sliders" size="20" />
                <span>Filter</span>
              </button>
              <!-- Filter Dropdown -->
              <div v-if="isFilterVisible"
                class="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-md shadow-md p-4 w-48">
                <label class="block mb-2 font-medium text-gray-700">Filter by Status:</label>
                <select v-model="filterStatus" class="w-full p-2 border border-gray-300 rounded-md">
                  <option value="">All</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Orders Table -->
          <div class="overflow-x-auto bg-white border border-gray-300 rounded-md shadow-sm">
            <table class="w-full table-auto">
              <thead class="bg-gray-100">
                <tr>
                  <th class="py-3 px-4 text-left font-semibold text-gray-700">
                    Order ID.
                  </th>
                  <th class="py-3 px-4 text-left font-semibold text-gray-700">
                    Date
                  </th>
                  <th class="py-3 px-4 text-left font-semibold text-gray-700">
                    Customer Name
                  </th>
                  <th class="py-3 px-4 text-left font-semibold text-gray-700">
                    Phone No.
                  </th>
                  <th class="py-3 px-4 text-left font-semibold text-gray-700">
                    Product
                  </th>
                  <th class="py-3 px-4 text-left font-semibold text-gray-700">
                    Qty.
                  </th>
                  <th class="py-3 px-4 text-left font-semibold text-gray-700">
                    Unit Price
                  </th>
                  <th class="py-3 px-4 text-left font-semibold text-gray-700">
                    Total
                  </th>
                  <th class="py-3 px-4 text-center font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50">
                  <td class="py-4 px-4 border-b">{{ order.id }}</td>
                  <td class="py-4 px-4 border-b">{{ order.date }}</td>
                  <td class="py-4 px-4 border-b">{{ order.customerName }}</td>
                  <td class="py-4 px-4 border-b">{{ order.phone }}</td>
                  <td class="py-4 px-4 border-b">
                    <img :src="order.productImage" alt="Product Image" class="w-10 h-10 rounded-full object-cover" />
                  </td>
                  <td class="py-4 px-4 border-b">{{ order.quantity }}kg</td>
                  <td class="py-4 px-4 border-b">
                    &#8369;{{ order.unitPrice.toFixed(2) }}
                  </td>
                  <td class="py-4 px-4 border-b">
                    &#8369;{{ order.total.toFixed(2) }}
                  </td>
                  <td class="py-4 px-4 border-b text-center">
                    <select v-model="order.status" class="px-3 py-1 rounded-full text-white" :class="{
                      'bg-blue-500': order.status === 'In Progress',
                      'bg-green-500': order.status === 'Completed',
                      'bg-red-500': order.status === 'Cancelled',
                    }">
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
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
import { ref, computed } from "vue";
import AdminLayout from "~/layouts/AdminLayout.vue";
import SideBarLayout from "~/layouts/SideBarLayout.vue";

import { useUserStore } from "~/stores/user";
const userStore = useUserStore();
const user = useSupabaseUser();
const route = useRoute();

await userStore.isAdmin();

// watchEffect(() => {
//   if (
//     route.fullPath == "/admin/orders" &&
//     (!user.value || !userStore.isAdmin)
//   ) {
//     navigateTo("/login");
//   }
// });

// Dummy order data
const orders = ref([
  {
    id: "#12345AB",
    date: "Oct. 4, 2024",
    customerName: "Juan Dela Cruz",
    phone: "09573196842",
    productImage: "/path/to/tomato.jpg",
    quantity: 5,
    unitPrice: 50,
    total: 250,
    status: "In Progress",
  },
  {
    id: "#40D6F2D",
    date: "Oct. 4, 2024",
    customerName: "Juan Dela Cruz",
    phone: "09573196842",
    productImage: "/path/to/eggplant.jpg",
    quantity: 3,
    unitPrice: 100,
    total: 300,
    status: "Completed",
  },
  {
    id: "#3AFA384",
    date: "Oct. 2, 2024",
    customerName: "Eduardo Guerrera",
    phone: "09401392253",
    productImage: "/path/to/cabbage.jpg",
    quantity: 10,
    unitPrice: 60,
    total: 600,
    status: "In Progress",
  },
  {
    id: "#F666AF7",
    date: "Oct. 1, 2024",
    customerName: "Alberto Mendez",
    phone: "09418742398",
    productImage: "/path/to/tomato.jpg",
    quantity: 5,
    unitPrice: 50,
    total: 250,
    status: "In Progress",
  },
]);

// Computed properties for stats
const totalOrders = computed(() => orders.value.length);
const pendingOrders = computed(
  () => orders.value.filter((order) => order.status === "In Progress").length
);
const cancelledOrders = computed(
  () => orders.value.filter((order) => order.status === "Cancelled").length
);
const orderSuccessRate = computed(() =>
  (
    (orders.value.filter((order) => order.status === "Completed").length /
      orders.value.length) *
    100
  ).toFixed(0)
);

// Search and Filter functionality
const searchQuery = ref("");
const filterStatus = ref("");
const isFilterVisible = ref(false);

const filteredOrders = computed(() => {
  let filtered = orders.value;
  if (searchQuery.value !== "") {
    filtered = filtered.filter(
      (order) =>
        order.customerName
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  if (filterStatus.value !== "") {
    filtered = filtered.filter((order) => order.status === filterStatus.value);
  }
  return filtered;
});

// Methods
const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value;
};
</script>

<style scoped>
.main-content {
  padding-top: 100px;
}

.button:hover .group-hover\:text-white {
  color: white;
}
</style>
