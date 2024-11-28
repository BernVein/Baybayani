<template>
  <AdminLayout>
    <div id="OrdersPage" class="mt-4 max-w-[1200px] mx-auto px-2 min-h-[50vh]">
      <div class="bg-white w-full p-6 min-h-[150px]">
        <div class="flex items-center text-xl">
          <Icon name="carbon:delivery" color="#5FCB04" size="35" />
          <span class="pl-4">Orders</span>
        </div>

        <!-- Loading state -->
        <div v-if="orders === null" class="flex items-center justify-center">
          Loading...
        </div>

        <!-- Check if there are orders -->
        <div v-if="orders && orders.data && orders.data.length > 0">
          <div v-for="(order, index) in orders.data" :key="order.id" class="border-b py-4 relative">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <div class="font-semibold mb-2">Order #{{ order.id }}</div>
                <div :class="statusClass(order.orderStatus)" class="w-3.5 h-3.5 rounded-full"></div>
                <span class="ml-2 text-sm capitalize">{{
                  order.orderStatus
                }}</span>
              </div>
              <div @click="toggleOrderOptions(order.id)" class="cursor-pointer">
                <Icon name="carbon:overflow-menu-horizontal" size="24" />
              </div>
            </div>

            <div v-if="selectedOrderId === order.id"
              class="absolute right-0 bg-white border shadow-md rounded-lg w-40 p-2">
              <button @click="viewOrderDetails(order.id)"
                class="w-full text-left p-2 hover:bg-gray-100 transition-colors">
                View Details
              </button>

              <!-- Conditionally show Cancel button if status is 'PENDING' -->
              <button v-if="order.orderStatus === 'PENDING'" @click="deleteOrder(order.id)"
                class="w-full text-left p-2 hover:bg-gray-100 text-red-500 transition-colors">
                Cancel Order
              </button>
            </div>

            <!-- Order Items -->
            <div v-if="order.orderItem && order.orderItem.length > 0">
              <div v-for="(item, itemIndex) in order.orderItem" :key="item.id"
                class="flex items-center gap-3 p-1 hover:underline hover:text-blue-500">
                <img width="40" :src="item.product.url" alt="Product Image" />
                <NuxtLink :to="`/item/${item.productId}`">
                  {{ item.product.title }} - Quantity: {{ item.quantity }} kg
                </NuxtLink>
              </div>
            </div>

            <!-- Display Total Price -->
            <div class="text-[#FF4646] mt-4 font-bold text-xl text-right">
              Total: ₱{{ order.totalPrice.toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- No orders found -->
        <div v-else class="flex items-center justify-center">
          You have no order history
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from "~/layouts/AdminLayout.vue";
import { useUserStore } from "~/stores/user";
import { ref, onBeforeMount, watchEffect } from "vue";
const userStore = useUserStore();
const user = useSupabaseUser();
let orders = ref(null);
let selectedOrderId = ref(null);

watchEffect(async () => {
  if (!user.value) {
    await navigateTo("/login");
  }
});


onBeforeMount(async () => {
  try {
    orders.value = await useFetch(
      `/api/prisma/get-all-orders-by-user/${user.value.id}`
    );
    if (!orders.value.data) {
      throw new Error("Failed to load orders");
    }
  } catch (error) {
    console.error(error);
  }
});

const toggleOrderOptions = (orderId) => {
  selectedOrderId.value = selectedOrderId.value === orderId ? null : orderId;
};

const viewOrderDetails = (orderId) => {
  navigateTo(`/order/${orderId}`);
};

const deleteOrder = async (orderId) => {
  try {
    await useFetch(`/api/prisma/delete-order/${orderId}`, { method: "DELETE" });
    orders.value = orders.value.filter((order) => order.id !== orderId);
  } catch (error) {
    console.error("Error deleting order:", error);
  }
};

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
</script>
