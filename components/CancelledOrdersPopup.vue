<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>
      
      <!-- Popup Content -->
      <div class="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="bg-white rounded-t-lg p-4 border-b">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-red-600 flex items-center">
              <Icon name="mdi:alert-circle" size="24" class="mr-2" />
              Cancelled Orders
            </h2>
            <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
              <Icon name="mdi:close" size="24" />
            </button>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="bg-white flex-1 overflow-y-auto rounded-b-lg">
          <div class="p-6">
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

            <div class="mt-4 text-sm text-gray-600 text-center">
              These orders were cancelled due to store closing time.
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  },
  orders: {
    type: Array,
    required: true
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar styles */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
</style> 