<template>
  <div class="flex justify-between my-2">
    <!-- Left Section: Product Details -->
    <div class="flex items-center w-full">
      <!-- Product Image -->
      <img class="rounded-md md:w-[150px] w-[90px]" :src="product.product.url" loading="lazy"
        :class="{ 'opacity-50': product.product.stock <= 0 }" />

      <div class="overflow-hidden pl-2 w-full">
        <!-- Category and Product Title -->
        <div class="flex items-center">
          <span class="bg-[#0C6539] text-white text-[11px] font-semibold px-1.5 rounded-sm min-w-[60px] text-center">
            Vegetables
          </span>
          <div class="truncate pl-2" :class="{ 'opacity-50': product.product.stock <= 0 }">
            {{ product.product.title }}
          </div>
        </div>

        <!-- Price and Quantity -->
        <div class="flex flex-col mt-2" :class="product.product.stock <= 0 ? 'text-gray-400' : 'text-[#FD374F]'">
          <div class="text-lg font-semibold">
            ₱<span class="font-bold">{{ product.product.price * product.quantity }}</span>
          </div>
          <div class="text-sm font-semibold mt-1">
            x<span class="font-bold">{{ product.quantity }} kg</span>
          </div>
        </div>

        <!-- Stock Status -->
        <div v-if="product.product.stock <= 0" class="text-red-500 text-xs mt-1">
          Out of stock
        </div>
        <div v-else-if="product.quantity > product.product.stock" class="text-red-500 text-xs mt-1">
          Only {{ product.product.stock }} kg available
        </div>
      </div>
    </div>

    <!-- Right Section: edit cart / go to shopping cart Button -->
    <button @click="editCart()" :disabled="product.product.stock <= 0" class="hover:text-red-500"
      :class="{ 'opacity-50 cursor-not-allowed': product.product.stock <= 0 }">
      <Icon name="line-md:edit" size="20" />
    </button>
  </div>
</template>
<script setup>
const props = defineProps(["product"]);
const { product } = toRefs(props);

const editCart = () => {
  if (product.value.product.stock <= 0) return;
  window.location.href = `/shoppingcart`;
};
</script>