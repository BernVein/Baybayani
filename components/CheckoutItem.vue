<template>
  <div class="flex justify-between my-2">
    <!-- Left Section: Product Details -->
    <div class="flex items-center w-full">
      <!-- Product Image -->
      <img class="rounded-md md:w-[150px] w-[90px]" :src="product.product.url" />

      <div class="overflow-hidden pl-2 w-full">
        <!-- Category and Product Title -->
        <div class="flex items-center">
          <span
            class="bg-[#0C6539] text-white text-[11px] font-semibold px-1.5 rounded-sm min-w-[60px] text-center">Vegetables</span>
          <div class="truncate pl-2">{{ product.product.title }}</div>
        </div>

        <!-- Price and Quantity -->
        <div class="flex flex-col mt-2 text-[#FD374F]">
          <div class="text-lg font-semibold">
            ₱
            <span class="font-bold">{{
              product.product.price * product.quantity
              }}</span>
          </div>
          <div class="text-sm font-semibold mt-1">
            x<span class="font-bold text-[#FD374F]">{{ product.quantity }} kg</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Section: edit cart / go to shopping cart Button -->
    <button @click="editCart()" class="hover:text-red-500">
      <Icon name="line-md:edit" size="20" />
    </button>
  </div>
</template>

<script setup>

const props = defineProps(["product"]);
const { product } = toRefs(props);

const productPrice = product.value.price
console.log('priceeeeeeeeeeeee');
console.log(product.value.price);
console.log(product.value.price);



const editCart = () => {

  // const router = useRouter();
  // router.push({ path: "/shoppingcart" }); // Replace with your actual route path
  window.location.href = `/shoppingcart`;

};
</script>
