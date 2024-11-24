<template>
  <AdminLayout>
    <div id="ShoppingCartPage" class="mt-4 max-w-[1200px] mx-auto px-2">
      <!-- Empty Cart -->
      <div v-if="filteredCartItems && filteredCartItems.length === 0" class="h-[500px] flex items-center justify-center">
        <div class="pt-20">
          <img class="mx-auto" width="250" src="/baybayani-logo.png" />
          <div class="text-xl text-center mt-4">No items yet?</div>
          <div v-if="!user" class="flex text-center">
            <NuxtLink
              to="./login"
              class="bg-[#28a745] w-full text-white text-[21px] font-semibold p-1.5 rounded-full mt-4 transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-[#218838]"
            >
              Sign in
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Cart Items -->
      <div v-else class="md:flex gap-4 justify-between mx-auto w-full">
        <div class="md:w-[65%]">
          <!-- Shopping Cart Header -->
          <div class="bg-white rounded-lg p-4">
            <div class="text-2xl font-bold mb-2">
              Shopping Cart ({{ filteredCartItems.length }})
            </div>
          </div>
          <div class="bg-[#FEEEEF] rounded-lg p-4 mt-4">
            <div class="text-red-500 font-bold">
              Always ask for the availability of each item before adding to checkout!
            </div>
          </div>
          <div id="Items" class="bg-white rounded-lg p-4 mt-4">
            <div v-for="(cartItem, index) in filteredCartItems" :key="cartItem.id">
              <CartItem
                v-if="cartItem.product"
                :product="cartItem.product"
                :selectedArray="selectedArray"
                @selectedRadio="selectedRadioFunc"
              />
              <div v-else class="text-red-500">
                Product details not available for {{ cartItem.productId }}
              </div>
            </div>
          </div>
        </div>
        <div class="md:hidden block my-4" />
        <div class="md:w-[35%]">
          <div id="Summary" class="bg-white rounded-lg p-4">
            <div class="text-2xl font-extrabold mb-2">Summary</div>
            <div class="flex items-center justify-between my-4">
              <div class="font-semibold">Total</div>
              <div class="text-2xl font-semibold text-[#FD374F]">
                ₱<span class="font-extrabold text-[#FD374F]">{{ totalPriceComputed }}</span>
              </div>
            </div>
            <button
              @click="goToCheckout"
              class="flex items-center justify-center bg-[#0C6539] w-full text-white text-[21px] font-semibold p-1.5 rounded-full mt-4"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>


<script setup>
import { onMounted, computed, ref } from "vue";
import AdminLayout from "~/layouts/AdminLayout.vue";
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const user = useSupabaseUser();

let selectedArray = ref([]);

// Filter out products that are hidden or deleted
const filteredCartItems = computed(() => {
  if (!Array.isArray(userStore.cartItems)) {
    console.warn("userStore.cartItems is not an array:", userStore.cartItems);
    return [];
  }

  return userStore.cartItems.filter((item) => {
    if (!item.product) {
      console.warn("Cart item is missing product:", item);
      return false; // Exclude invalid items
    }
    return !item.product.hidden && !item.product.isDeleted;
  });
});

// Total items in the selected array
const totalItemsCount = computed(() => {
  return selectedArray.value.reduce((sum, item) => sum + (item.val ? 1 : 0), 0);
});

// Total weight of selected items
const totalSelectedWeight = computed(() => {
  return selectedArray.value.reduce(
    (sum, item) => sum + (item.val ? parseFloat(item.quantity) : 0),
    0
  );
});

// Compute total price of selected items
const totalPriceComputed = computed(() => {
  return selectedArray.value.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
});

// Update selected items array when items are selected
const selectedRadioFunc = (e) => {
  const existingIndex = selectedArray.value.findIndex(
    (item) => item.id === e.id
  );

  if (e.val) {
    if (existingIndex === -1) {
      selectedArray.value.push({ ...e, quantity: e.quantity });
    } else {
      selectedArray.value[existingIndex].quantity = e.quantity;
    }
  } else {
    if (existingIndex !== -1) {
      selectedArray.value.splice(existingIndex, 1);
    }
  }
};

// Fetch cart items when the page loads
onMounted(async () => {
  await userStore.fetchCartItems();
});
</script>
