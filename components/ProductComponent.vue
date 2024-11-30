<template>
  <div
    :id="`ProductComponent${product.id}`"
    class="bg-white inline-block rounded hover:shadow-[0_0_10px_3px_rgba(0,0,0,0.15)] cursor-pointer"
  >
    <NuxtLink :to="`/item/${product.id}`">
      <img class="rounded-t" :src="product.url" />

      <div id="ProductDetails">
        <span class="flex items-center justify-start gap-3 px-1 pt-1 pb-1">
          <span class="text-[#FF6674] font-semibold text-lg">₱{{ priceComputed }}</span>
        </span>

        <div class="flex items-center gap-1 px-1 relative -top-1">
          <span class="bg-[#0C6539] text-white text-[10px] font-semibold px-1.5 rounded-sm">Vegetables</span>
          <span v-if="isTopProduct" class="bg-yellow-500 text-white text-[10px] font-semibold px-1.5 rounded-sm">Top Product</span>
        </div>

        <p class="px-1 pt-0.5 text-md text-[#252525] font-semibold">
          {{ product.title.substring(0, 60) }}
        </p>

        <p class="flex items-center px-1 pt-0.5 text-xs text-[#252525] pb-3">
          {{ productSales[product.id] || 0 }} kg sold
        </p>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps(["product", "isTopProduct"]);
const { product } = toRefs(props);

const productSales = ref({});

const fetchProductSales = async () => {
  try {
    const response = await axios.get('/api/prisma/get-all-orders');
    const fulfilledOrders = response.data.filter(order => order.orderStatus === 'FULFILLED');

    const salesCount = {};
    fulfilledOrders.forEach(order => {
      order.orderItem.forEach(item => {
        if (salesCount[item.productId]) {
          salesCount[item.productId] += item.quantity;
        } else {
          salesCount[item.productId] = item.quantity;
        }
      });
    });

    productSales.value = salesCount;
  } catch (error) {
    console.error("Error fetching product sales:", error);
  }
};

onMounted(() => {
  fetchProductSales();
});

const priceComputed = computed(() => {
  return product.value.price;
});
</script>
