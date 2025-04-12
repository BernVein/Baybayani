<template>
  <div :id="`ProductComponent${product.id}`"
    class="bg-white inline-block rounded hover:shadow-[0_0_10px_3px_rgba(0,0,0,0.15)] cursor-pointer">
    <NuxtLink :to="`/item/${product.id}`">
      <img class="rounded-t" :src="product.url" loading="lazy" />

      <div id="ProductDetails" class="p-2">
        <div class="flex flex-col">
          <!-- Price -->
          <span class="text-[#FF6674] font-semibold text-lg">₱{{ priceComputed }} / kilo</span>

          <!-- Stock Information -->
          <div class="flex items-center gap-1 mt-1">
            <span v-if="product.stock > 0" class="text-xs text-gray-500">
              Available: {{ product.stock }} kg
            </span>
            <span v-else class="text-xs text-gray-500">
              (Currently out of stock)
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1 mt-1">
          <span class="bg-[#0C6539] text-white text-[10px] font-semibold px-1.5 rounded-sm">Vegetables</span>
        </div>

        <p class="pt-1 text-md text-[#252525] font-semibold">
          {{ product.title.substring(0, 60) }}
        </p>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(["product"]);
const { product } = toRefs(props);

const priceComputed = computed(() => {
  return product.value.price;
});
</script>