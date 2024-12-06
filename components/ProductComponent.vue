<template>
  <div
    :id="`ProductComponent${product.id}`"
    class="bg-white inline-block rounded hover:shadow-[0_0_10px_3px_rgba(0,0,0,0.15)] cursor-pointer"
  >
    <NuxtLink :to="`/item/${product.id}`">
      <img class="rounded-t" :src="product.url" />

      <div id="ProductDetails">
        <span class="flex items-center justify-start gap-3 px-1 pt-1 pb-1">
          <span class="text-[#FF6674] font-semibold text-lg">₱{{ priceComputed }} / kilo</span>
        </span>

        <div class="flex items-center gap-1 px-1 relative -top-1">
          <span class="bg-[#0C6539] text-white text-[10px] font-semibold px-1.5 rounded-sm">Vegetables</span>
        </div>

        <p class="px-1 pt-0.5 text-md text-[#252525] font-semibold">
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
