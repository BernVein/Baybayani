<template>
  <div class="flex h-screen">
    <!-- Sidebar Layout -->
    <SideBarLayout
      class="sidebar fixed lg:relative lg:transform lg:translate-x-0 lg:w-64 w-64 transform -translate-x-full transition-transform duration-300 ease-in-out lg:shadow-none shadow-lg"
      :class="{ 'translate-x-0': isSidebarOpen }" />

    <!-- Admin Layout -->
    <AdminLayout class="admin-layout">
      <div class="main-content flex-1 overflow-y-auto p-6">
        <!-- Title -->
        <h1 class="text-3xl font-semibold mb-8">Farmer Dashboard</h1>

        <!-- Dashboard Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-red-600">
            <p class="text-lg font-medium">Total Products</p>
            <p class="text-4xl font-bold">10</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-green-600">
            <p class="text-lg font-medium">Products Sold</p>
            <p class="text-4xl font-bold">100</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-blue-600">
            <p class="text-lg font-medium">Total Revenue</p>
            <p class="text-4xl font-bold">₱50,000</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-yellow-600">
            <p class="text-lg font-medium">Revenue Today</p>
            <p class="text-4xl font-bold">₱5,000</p>
          </div>
        </div>

        <!-- Revenue and Product Widgets -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Total Revenue Chart -->
          <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">
                <Icon name="mdi:cash-register" size="24" class="inline-block mr-2" />Total Revenue
              </h2>
              <select v-model="totalRevenueFilter" @change="updateTotalRevenueChart" class="border p-2 rounded-md">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <canvas id="totalRevenueChart"></canvas>
          </div>

          <!-- Top Products Widget -->
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">
                <Icon name="mdi:fire" size="24" class="inline-block mr-2" />Top
                Products
              </h2>
              <select v-model="topProductsFilter" @change="updateTopProducts" class="border p-2 rounded-md">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <ul class="space-y-3">
              <li class="flex items-center justify-between" v-for="product in filteredTopProducts" :key="product.name">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    Placeholder
                  </div>
                  <span>{{ product.name }}</span>
                </div>
                <span>{{ product.sold }}kg Sold</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Sales Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <!-- Product Sales Chart -->
          <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">
                <Icon name="mdi:chart-line" size="24" class="inline-block mr-2" />Product Sales
              </h2>
              <select v-model="productSalesFilter" @change="updateProductSalesChart" class="border p-2 rounded-md">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <canvas id="productSalesChart"></canvas>
          </div>

          <!-- Product Sales Trend Chart -->
          <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">
                <Icon name="mdi:chart-pie" size="24" class="inline-block mr-2" />Product Sales Trend
              </h2>
              <select v-model="productSalesTrendFilter" @change="updateProductSalesTrendChart"
                class="border p-2 rounded-md">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <canvas id="productSalesTrendChart"></canvas>
          </div>
        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AdminLayout from "~/layouts/AdminLayout.vue";
import SideBarLayout from "~/layouts/SideBarLayout.vue";
import Chart from "chart.js/auto";

import { useUserStore } from "~/stores/user";
const userStore = useUserStore();
const user = useSupabaseUser();
const route = useRoute();

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// watchEffect(() => {
//   console.log("IsAdmin(Sa Dashboard)??");
//   userStore.isAdmin();
//   console.log(userStore.isAdmin === true);
//   if (
//     route.fullPath == "/admin/dashboard" &&
//     (!user.value || userStore.isAdmin === false)
//   ) {
//     navigateTo("/login");
//   }
// });

const totalRevenueFilter = ref("weekly");
const topProductsFilter = ref("weekly");
const productSalesFilter = ref("weekly");
const productSalesTrendFilter = ref("weekly");

const topProductsData = {
  weekly: [
    { name: "Tomato", sold: 100 },
    { name: "Onion", sold: 90 },
    { name: "Carrot", sold: 50 },
    { name: "Eggplant", sold: 40 },
  ],
  monthly: [
    { name: "Tomato", sold: 400 },
    { name: "Onion", sold: 350 },
    { name: "Carrot", sold: 250 },
    { name: "Eggplant", sold: 200 },
  ],
};

const filteredTopProducts = ref(topProductsData[topProductsFilter.value]);

const updateTopProducts = () => {
  filteredTopProducts.value = topProductsData[topProductsFilter.value];
};

const updateTotalRevenueChart = () => {
  const labels =
    totalRevenueFilter.value === "weekly"
      ? [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Yesterday",
        "Today",
      ]
      : [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
  const data =
    totalRevenueFilter.value === "weekly"
      ? [10000, 5000, 8000, 11000, 13000, 4000, 9000]
      : [
        50000, 70000, 60000, 80000, 90000, 85000, 75000, 95000, 87000, 93000,
        91000, 88000,
      ];
  totalRevenueChart.data.labels = labels;
  totalRevenueChart.data.datasets[0].data = data;
  totalRevenueChart.update();
};

const updateProductSalesChart = () => {
  const labels =
    productSalesFilter.value === "weekly"
      ? [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Yesterday",
        "Today",
      ]
      : [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
  const data =
    productSalesFilter.value === "weekly"
      ? [30, 45, 25, 50, 40, 60, 35]
      : [150, 180, 160, 200, 220, 210, 190, 230, 240, 210, 200, 250];
  productSalesChart.data.labels = labels;
  productSalesChart.data.datasets[0].data = data;
  productSalesChart.update();
};

const updateProductSalesTrendChart = () => {
  const labels =
    productSalesTrendFilter.value === "weekly"
      ? ["Tomato", "Onion", "Carrot", "Eggplant"]
      : ["Tomato", "Onion", "Carrot", "Eggplant"];
  const data =
    productSalesTrendFilter.value === "weekly"
      ? [50, 30, 25, 10]
      : [200, 150, 180, 120];
  productSalesTrendChart.data.labels = labels;
  productSalesTrendChart.data.datasets[0].data = data;
  productSalesTrendChart.update();
};

let totalRevenueChart, productSalesChart, productSalesTrendChart;

onMounted(() => {
  // Total Revenue Chart
  const totalRevenueCtx = document
    .getElementById("totalRevenueChart")
    .getContext("2d");
  totalRevenueChart = new Chart(totalRevenueCtx, {
    type: "bar",
    data: {
      labels: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Yesterday",
        "Today",
      ],
      datasets: [
        {
          label: "Revenue in Peso",
          data: [10000, 5000, 8000, 11000, 13000, 4000, 9000],
          backgroundColor: "#4CAF50",
        },
      ],
    },
  });

  // Product Sales Chart
  const productSalesCtx = document
    .getElementById("productSalesChart")
    .getContext("2d");
  productSalesChart = new Chart(productSalesCtx, {
    type: "line",
    data: {
      labels: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Yesterday",
        "Today",
      ],
      datasets: [
        {
          label: "All products sold per kg",
          data: [30, 45, 25, 50, 40, 60, 35],
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "#36A2EB",
          borderWidth: 2,
        },
      ],
    },
  });

  // Product Sales Trend Chart
  const productSalesTrendCtx = document
    .getElementById("productSalesTrendChart")
    .getContext("2d");
  productSalesTrendChart = new Chart(productSalesTrendCtx, {
    type: "pie",
    data: {
      labels: ["Tomato", "Onion", "Carrot", "Eggplant"],
      datasets: [
        {
          label: "Product Sales Trend",
          data: [50, 30, 25, 10],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        },
      ],
    },
  });
});
</script>

<style scoped>
.main-content {
  padding-top: 100px;
}

.button:hover .group-hover\:text-white {
  color: white;
}

.sidebar {
  transition: transform 0.3s ease;
}

@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
