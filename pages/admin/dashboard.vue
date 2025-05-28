<template>
  <div class="flex h-screen">
    <!-- Sidebar Layout -->
    <SideBarLayout
      class="sidebar fixed lg:relative lg:transform lg:translate-x-0 lg:w-64 w-64 transform -translate-x-full transition-transform duration-300 ease-in-out lg:shadow-none shadow-lg"
      :class="{ 'translate-x-0': isSidebarOpen }" />

    <!-- Admin Layout -->
    <LayoutAdmin class="admin-layout">
      <div class="main-content flex-1 overflow-y-auto p-6">
        <!-- Loading Component -->
        <Loading v-if="isLoading" />
        
        <!-- Title and Refresh Section -->
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-semibold">Dashboard</h1>
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600" v-if="lastUpdated">
              Last updated: {{ formatLastUpdated }}
            </span>
            <button @click="fetchDashboardData"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Icon name="mdi:refresh" />
              Refresh Data
            </button>
          </div>
        </div>

        <!-- Dashboard Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-red-600">
            <p class="text-lg font-medium">Total Products</p>
            <p class="text-4xl font-bold overflow-hidden">
              <span :key="`products-${animationKey}`" class="inline-block animate-number">
                {{ formatNumber(dashboardSummary.totalProducts) }}
              </span>
            </p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-green-600">
            <p class="text-lg font-medium">Products Sold</p>
            <p class="text-4xl font-bold overflow-hidden">
              <span :key="`sold-${animationKey}`" class="inline-block animate-number">
                {{ formatNumber(dashboardSummary.totalSold) }}
              </span>
            </p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-blue-600">
            <p class="text-lg font-medium">Total Revenue</p>
            <div class="text-4xl font-bold overflow-hidden relative group cursor-help"
              :title="`₱${formatNumber(dashboardSummary.rawTotalRevenue)}`">
              <span :key="`revenue-${animationKey}`" class="inline-block animate-number">
                ₱{{ dashboardSummary.totalRevenue }}
              </span>
              <!-- Tooltip -->
              <div class="tooltip">
                ₱{{ formatNumber(dashboardSummary.rawTotalRevenue) }}
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-yellow-600">
            <p class="text-lg font-medium">Revenue Today</p>
            <div class="text-4xl font-bold overflow-hidden relative group cursor-help"
              :title="`₱${formatNumber(dashboardSummary.rawTodayRevenue)}`">
              <span :key="`today-${animationKey}`" class="inline-block animate-number">
                ₱{{ dashboardSummary.todayRevenue }}
              </span>
              <!-- Tooltip -->
              <div class="tooltip">
                ₱{{ formatNumber(dashboardSummary.rawTodayRevenue) }}
              </div>
            </div>
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
              <li v-if="filteredTopProducts.length === 0" class="text-center text-gray-500">
                No sales data available
              </li>
              <li v-for="product in filteredTopProducts" :key="`${product.name}-${animationKey}`"
                class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    <img v-if="product.url" :src="product.url" :alt="product.name" class="w-full h-full object-cover">
                    <span v-else>{{ product.name.charAt(0) }}</span>
                  </div>
                  <span class="font-medium">{{ product.name }}</span>
                </div>
                <span class="text-gray-600 overflow-hidden">
                  <span class="inline-block animate-number">
                    {{ formatNumber(product.sold) }}kg Sold
                  </span>
                </span>
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

        <!-- Store Hours Settings -->
        <div class="bg-white p-6 rounded-lg shadow mt-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">
              <Icon name="mdi:clock-outline" size="24" class="inline-block mr-2" />Store Hours
            </h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Opening Time -->
            <div class="border p-4 rounded-lg">
              <h3 class="text-lg font-medium mb-3">Opening Time</h3>
              <div class="flex items-center gap-2">
                <select v-model="openingHour" class="border p-2 rounded-md w-24">
                  <option v-for="h in 24" :key="`open-h-${h-1}`" :value="h-1">{{ formatHour(h-1) }}</option>
                </select>
                <span>:</span>
                <select v-model="openingMinute" class="border p-2 rounded-md w-24">
                  <option value="0">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
                <span class="ml-2">{{ openingHour >= 12 ? 'PM' : 'AM' }}</span>
              </div>
              <p class="text-gray-600 mt-2">Current: {{ userStore.formattedOpeningTime() }}</p>
            </div>
            
            <!-- Closing Time -->
            <div class="border p-4 rounded-lg">
              <h3 class="text-lg font-medium mb-3">Closing Time</h3>
              <div class="flex items-center gap-2">
                <select v-model="closingHour" class="border p-2 rounded-md w-24">
                  <option v-for="h in 24" :key="`close-h-${h-1}`" :value="h-1">{{ formatHour(h-1) }}</option>
                </select>
                <span>:</span>
                <select v-model="closingMinute" class="border p-2 rounded-md w-24">
                  <option value="0">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
                <span class="ml-2">{{ closingHour >= 12 ? 'PM' : 'AM' }}</span>
              </div>
              <p class="text-gray-600 mt-2">Current: {{ userStore.formattedClosingTime() }}</p>
            </div>
          </div>
          
          <div class="mt-4 flex justify-end">
            <button @click="saveStoreHours" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Save Store Hours
            </button>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  </div>

  <!-- Toast Notifications -->
  <div class="fixed top-24 right-4 z-50">
    <div v-for="toast in toasts" :key="toast.id"
      class="mb-2 p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in" 
      :class="{
        'bg-green-500 text-white': toast.type === 'success',
        'bg-red-500 text-white': toast.type === 'error'
      }">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import LayoutAdmin from "~/layouts/LayoutAdmin.vue";
import SideBarLayout from "~/layouts/SideBarLayout.vue";
import Chart from "chart.js/auto";
import Loading from "~/components/Loading.vue";

import { useUserStore } from "~/stores/user";
const userStore = useUserStore();
const user = useSupabaseUser();
const route = useRoute();

const role = userStore.profile?.role;

// Loading state
const isLoading = ref(false);

// Toast notifications
const toasts = ref([]);

// Add toast function
const showToast = (message, type = 'success') => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 3000);
};

// Store hours settings
const openingHour = ref(userStore.openingHour);
const openingMinute = ref(userStore.openingMinute);
const closingHour = ref(userStore.closingHour);
const closingMinute = ref(userStore.closingMinute);

// Format hour for display in dropdowns
const formatHour = (hour) => {
  return hour % 12 || 12;
};

// Save store hours
const saveStoreHours = async () => {
  try {
    // Show loading screen
    isLoading.value = true;
    
    // Use the async versions of the time update functions
    const openingResult = await userStore.updateOpeningTime(openingHour.value, openingMinute.value);
    const closingResult = await userStore.updateClosingTime(closingHour.value, closingMinute.value);
    
    if (openingResult && closingResult) {
      // Show success notification
      showToast(`Store hours updated to ${userStore.formattedOpeningTime()} - ${userStore.formattedClosingTime()} PHT`, "success");
    } else {
      throw new Error("Failed to save settings");
    }
  } catch (error) {
    console.error("Store hours update error:", error);
    showToast("Failed to update store hours. Please try again.", "error");
  } finally {
    // Hide loading screen
    isLoading.value = false;
  }
};

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

watchEffect(async () => {
  // Wait for user profile to be loaded
  await userStore.fetchUser();
  if (route.fullPath == "/admin/dashboard" && (!user.value || !userStore.isAdmin())) {
    navigateTo("/login");
  }
});

const totalRevenueFilter = ref("weekly");
const topProductsFilter = ref("weekly");
const productSalesFilter = ref("weekly");
const productSalesTrendFilter = ref("weekly");

const orders = ref([]);
const products = ref([]);
const currentDate = new Date();

// Add ref for last updated timestamp
const lastUpdated = ref(null);

// Add computed property to format the timestamp
const formatLastUpdated = computed(() => {
  if (!lastUpdated.value) return '';
  return new Date(lastUpdated.value).toLocaleString();
});

// Add a number formatting helper function
const formatNumber = (number) => {
  return new Intl.NumberFormat('en-PH').format(number);
};

// Add ref for animation trigger
const animationKey = ref(0);

// Update fetchDashboardData to trigger animation
const fetchDashboardData = async () => {
  try {
    // Increment key to trigger animation
    animationKey.value++;

    const [ordersResponse, productsResponse] = await Promise.all([
      $fetch('/api/prisma/get-all-orders'),
      $fetch('/api/prisma/get-all-products')
    ]);

    orders.value = ordersResponse.filter(order =>
      order.orderStatus === 'FULFILLED' &&
      order.orderItem &&
      order.orderItem.length > 0
    );
    products.value = productsResponse;

    // Update charts and timestamp
    updateTotalRevenueChart();
    updateTopProducts();
    updateProductSalesChart();
    updateProductSalesTrendChart();
    lastUpdated.value = new Date();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

// Helper to filter data by date range
const filterDataByDate = (data, filter) => {
  const today = new Date();
  const pastDate = new Date();

  if (filter === 'weekly') {
    pastDate.setDate(today.getDate() - 7);
  } else {
    pastDate.setMonth(today.getMonth() - 1);
  }

  return data.filter(item => {
    const itemDate = new Date(item.created_at);
    return itemDate >= pastDate && itemDate <= today;
  });
};

// Declare chart variables outside of onMounted
let charts = {
  totalRevenue: null,
  productSales: null,
  productSalesTrend: null
};

// Initialize charts
const initializeCharts = () => {
  // Total Revenue Chart
  const totalRevenueCtx = document.getElementById("totalRevenueChart")?.getContext("2d");
  if (totalRevenueCtx) {
    charts.totalRevenue = new Chart(totalRevenueCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [{
          label: "Revenue in Peso",
          data: [],
          backgroundColor: "#4CAF50",
        }],
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `₱${formatNumber(context.raw)}`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: (value) => `₱${formatNumber(value)}`
            }
          }
        }
      }
    });
  }

  // Product Sales Chart
  const productSalesCtx = document.getElementById("productSalesChart")?.getContext("2d");
  if (productSalesCtx) {
    charts.productSales = new Chart(productSalesCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [{
          label: "All products sold per kg",
          data: [],
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "#36A2EB",
          borderWidth: 2,
        }],
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${formatNumber(context.raw)}kg`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: (value) => `${formatNumber(value)}kg`
            }
          }
        }
      }
    });
  }

  // Product Sales Trend Chart
  const productSalesTrendCtx = document.getElementById("productSalesTrendChart")?.getContext("2d");
  if (productSalesTrendCtx) {
    charts.productSalesTrend = new Chart(productSalesTrendCtx, {
      type: "pie",
      data: {
        labels: [],
        datasets: [{
          label: "Product Sales Trend",
          data: [],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        }],
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${formatNumber(context.raw)}kg`
            }
          }
        }
      }
    });
  }
};

// Update the chart update functions to use the new charts object
const updateTotalRevenueChart = () => {
  if (!charts.totalRevenue) return;

  const filteredOrders = filterDataByDate(orders.value, totalRevenueFilter.value);

  let labels = [];
  let data = [];

  if (totalRevenueFilter.value === 'weekly') {
    // Calculate weeks in the current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const weeks = [];

    let startOfWeek = new Date(firstDayOfMonth);
    while (startOfWeek <= lastDayOfMonth) {
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      weeks.push({ start: new Date(startOfWeek), end: new Date(endOfWeek) });
      startOfWeek.setDate(startOfWeek.getDate() + 7);
    }

    labels = weeks.map((_, index) => `Week ${index + 1}`);
    data = new Array(weeks.length).fill(0);

    filteredOrders.forEach(order => {
      const orderDate = new Date(order.created_at);
      weeks.forEach((week, index) => {
        if (orderDate >= week.start && orderDate <= week.end) {
          data[index] += order.totalPrice || 0;
        }
      });
    });
  } else {
    // Monthly logic remains unchanged
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    data = new Array(12).fill(0);

    filteredOrders.forEach(order => {
      const monthIndex = new Date(order.created_at).getMonth();
      data[monthIndex] += order.totalPrice || 0;
    });
  }

  charts.totalRevenue.data.labels = labels;
  charts.totalRevenue.data.datasets[0].data = data;
  charts.totalRevenue.update();
};

// First, add a ref for filteredTopProducts
const filteredTopProducts = ref([]);

// Update the Product Sales Chart function
const updateProductSalesChart = () => {
  if (!charts.productSales) return;

  const filteredOrders = filterDataByDate(orders.value, productSalesFilter.value);

  let labels, data;
  if (productSalesFilter.value === 'weekly') {
    // Calculate weeks in the current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const weeks = [];

    let startOfWeek = new Date(firstDayOfMonth);
    while (startOfWeek <= lastDayOfMonth) {
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      weeks.push({ start: new Date(startOfWeek), end: new Date(endOfWeek) });
      startOfWeek.setDate(startOfWeek.getDate() + 7);
    }

    labels = weeks.map((_, index) => `Week ${index + 1}`);
    data = new Array(weeks.length).fill(0);

    filteredOrders.forEach(order => {
      order.orderItem.forEach(item => {
        const orderDate = new Date(order.created_at);
        weeks.forEach((week, index) => {
          if (orderDate >= week.start && orderDate <= week.end) {
            data[index] += item.quantity;
          }
        });
      });
    });
  } else {
    // Monthly logic remains unchanged
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    data = new Array(12).fill(0);

    filteredOrders.forEach(order => {
      order.orderItem.forEach(item => {
        const monthIndex = new Date(order.created_at).getMonth();
        data[monthIndex] += item.quantity;
      });
    });
  }

  charts.productSales.data.labels = labels;
  charts.productSales.data.datasets[0].data = data;
  charts.productSales.update();
};

// Update the Product Sales Trend Chart function
const updateProductSalesTrendChart = () => {
  if (!charts.productSalesTrend) return;

  const filteredOrders = filterDataByDate(orders.value, productSalesTrendFilter.value);

  // Calculate sales per product
  const productSales = {};
  filteredOrders.forEach(order => {
    order.orderItem.forEach(item => {
      const productName = item.product.title;
      if (!productSales[productName]) {
        productSales[productName] = 0;
      }
      productSales[productName] += item.quantity;
    });
  });

  // Get top 4 products for the pie chart
  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const labels = topProducts.map(([name]) => name);
  const data = topProducts.map(([, value]) => value);

  charts.productSalesTrend.data.labels = labels;
  charts.productSalesTrend.data.datasets[0].data = data;
  charts.productSalesTrend.update();
};

// Update the Top Products function
const updateTopProducts = () => {
  const filteredOrders = filterDataByDate(orders.value, topProductsFilter.value);

  // Calculate total sales per product
  const productSales = {};
  filteredOrders.forEach(order => {
    order.orderItem.forEach(item => {
      const productId = item.productId;
      const productName = item.product.title;
      if (!productSales[productId]) {
        productSales[productId] = {
          name: productName,
          url: item.product.url,
          sold: 0
        };
      }
      productSales[productId].sold += item.quantity;
    });
  });

  // Sort by sales and get top 4
  filteredTopProducts.value = Object.values(productSales)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4);
};

// Helper function to format large numbers
const formatLargeNumber = (number) => {
  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1)}M`;
  }
  return formatNumber(number);
};

// Update dashboardSummary computed to use the new formatting function
const dashboardSummary = computed(() => {
  const totalProducts = products.value.length;

  const totalSold = orders.value.reduce((sum, order) =>
    sum + (order.orderItem?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0), 0);

  const rawTotalRevenue = orders.value.reduce((sum, order) =>
    sum + (order.totalPrice || 0), 0);

  const today = new Date().setHours(0, 0, 0, 0);
  const rawTodayRevenue = orders.value
    .filter(order => new Date(order.created_at).setHours(0, 0, 0, 0) === today)
    .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  return {
    totalProducts,
    totalSold,
    rawTotalRevenue,
    rawTodayRevenue,
    totalRevenue: formatLargeNumber(rawTotalRevenue),
    todayRevenue: formatLargeNumber(rawTodayRevenue)
  };
});

// Update onMounted to just fetch once
onMounted(() => {
  initializeCharts();
  fetchDashboardData();
});

// Add onUnmounted to clean up charts
onUnmounted(() => {
  // Destroy all charts to prevent memory leaks
  Object.values(charts).forEach(chart => {
    if (chart) {
      chart.destroy();
    }
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

@keyframes number-animation {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-number {
  animation: number-animation 0.5s ease-out forwards;
}

/* Tooltip styles */
.tooltip {
  @apply invisible opacity-0 absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded text-base whitespace-nowrap transition-all duration-200 z-50;
}

/* Show tooltip on hover */
.group:hover .tooltip {
  @apply visible opacity-100;
}

/* Optional: Add a small arrow to the tooltip */
.tooltip::before {
  content: '';
  @apply absolute -top-2 left-1/2 transform -translate-x-1/2 border-solid border-8 border-transparent border-b-gray-900;
}

/* Add smooth transition for hover effect */
.group {
  @apply transition-all duration-200;
}

.group:hover {
  @apply transform scale-105;
}

/* Toast animation styles */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
</style>
