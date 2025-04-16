<template>
  <div class="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-red-600">
        <Icon name="mdi:alert-circle" size="24" class="inline-block mr-2" />
        Cancelled Orders
      </h2>
      <button v-if="showCloseButton" @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
        <Icon name="mdi:close" size="24" />
      </button>
    </div>

    <div v-if="orders.length === 0" class="text-center text-gray-500 py-4">
      No cancelled orders to display.
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="border-b pb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium">Order #{{ order.id }}</span>
          <span class="text-sm text-gray-500">
            {{ new Date(order.modified_at).toLocaleString() }}
          </span>
        </div>

        <div class="space-y-2">
          <div v-for="item in order.orderItem" :key="item.id" 
               class="flex items-center gap-3 bg-gray-50 p-2 rounded">
            <img :src="item.product.url" :alt="item.product.title" 
                 class="w-12 h-12 object-cover rounded" />
            <div class="flex-1">
              <div class="font-medium">{{ item.product.title }}</div>
              <div class="text-sm text-gray-600">
                Quantity: {{ item.quantity }} kg
              </div>
            </div>
            <div class="text-right">
              ₱{{ formatPrice(item.product.price * item.quantity) }}
            </div>
          </div>
        </div>

        <div class="mt-2 text-right text-lg font-semibold">
          Total: ₱{{ formatPrice(order.totalPrice) }}
        </div>
      </div>
    </div>

    <div v-if="message" class="mt-4 text-sm text-gray-600 text-center">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  orders: {
    type: Array,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  showCloseButton: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close']);

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};
</script> 