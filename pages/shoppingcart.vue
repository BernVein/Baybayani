<template>
  <AdminLayout>
    <div id="ShoppingCartPage" class="mt-4 max-w-[1200px] mx-auto px-2">

      <div v-if="!filteredCartItems.length" class="h-[500px] flex items-center justify-center">
        <div class="pt-20">
          <img class="mx-auto" width="250" src="/baybayani-logo.png" />

          <div class="text-xl text-center mt-4">There is no product in your cart yet.</div>

          <!-- If not logged, goto login page -->
          <div v-if="!user" class="flex text-center">
            <NuxtLink to="/login"
              class="bg-[#FD374F] w-full text-white text-[21px] font-semibold p-1.5 rounded-full mt-4">
              Sign in
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else class="md:flex gap-4 justify-between mx-auto w-full">
        <div class="md:w-[65%]">
          <div class="bg-white rounded-lg p-4">
            <div class="flex items-center text-2xl font-semibold mb-2">
              <!-- Icon before the text -->
              <Icon name="ph:shopping-cart-simple" size="33" class="mr-4" />
              Shopping Cart ({{ filteredCartItems.length }})
            </div>
          </div>

          <div class="bg-[#FEEEEF] rounded-lg p-4 mt-4">
            <div class="text-red-500 font-bold">
              Always ask for the availability of each item before adding to
              checkout!
            </div>
          </div>

          <!-- The code dynamically renders a list of CartItem components from the user's cart, passing each product's data and selection state, and listens for selection changes to handle updates in the parent component. -->

          <div id="Items" class="bg-white rounded-lg p-4 mt-4">
            <div v-for="(cartItem, index) in filteredCartItems" :key="cartItem.id">
              <CartItem :product="filteredCartItems[index].product" :selectedArray="selectedArray"
                @selectedRadio="selectedRadioFunc" />
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
                ₱
                <span class="font-extrabold text-[#FD374F]">{{
                  totalPriceComputed
                }}</span>
              </div>
            </div>
            <button @click="goToCheckout"
              class="flex items-center justify-center bg-[#0C6539] w-full text-white text-[21px] font-semibold p-1.5 rounded-full mt-4">
              Checkout
            </button>
          </div>

          <div id="OrderDetails" class="bg-white rounded-lg p-4 mt-4">
            <div class="text-lg font-semibold mb-2">Order Details</div>

            <div class="border-b my-5" />
            <p class="my-2">Total Items: {{ totalItemsCount }}</p>
            <p class="my-2">Total Unit: {{ totalSelectedWeight }} kg</p>
          </div>
        </div>
      </div>
    </div>

  </AdminLayout>
</template>

<script setup>
import AdminLayout from "~/layouts/AdminLayout.vue";
import { useUserStore } from "~/stores/user";
import { ref, computed, watchEffect, onBeforeMount } from "vue";



const userStore = useUserStore();
const user = useSupabaseUser();
const route = useRoute();
const role = userStore.profile?.role;

// Redirect to the login page if the user is not logged in
watchEffect(() => {
  if (route.fullPath == "/shoppingcart" &&
    (!user.value || role === "Admin")) {
    navigateTo("/admin/dashboard");
  }
  else if (route.fullPath == "/shoppingcart" && !user.value) {
    navigateTo("/login");
  }
});




let selectedArray = ref([]);

// Filter out products that are hidden or deleted
const filteredCartItems = computed(() => {
  return userStore.cartItems?.filter(
    (item) => item.product && !item.product.hidden && !item.product.isDeleted
  ) || [];
});

// Compute total items count
const totalItemsCount = computed(() => {
  return selectedArray.value.reduce((sum, item) => sum + (item.val ? 1 : 0), 0);
});

// Compute total weight of selected items
const totalSelectedWeight = computed(() => {
  return selectedArray.value.reduce(
    (sum, item) => sum + (item.val ? parseFloat(item.quantity) : 0),
    0
  );
});

// Compute total price of selected items
const totalPriceComputed = computed(() => {
  return selectedArray.value.reduce(
    (sum, item) => sum + (item.val ? item.price * item.quantity : 0),
    0
  );
});

// Handle radio selection for cart items
const selectedRadioFunc = (e) => {
  const existingIndex = selectedArray.value.findIndex((item) => item.id === e.id);

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

// Handle checkout process
const goToCheckout = () => {
  if (selectedArray.value.length === 0 || !filteredCartItems.value.length) {
    console.warn("No items selected or cart is empty");
    return;
  }

  const ids = selectedArray.value.map((item) => item.id);

  userStore.checkout = [];
  const filteredItems = filteredCartItems.value.filter((item) =>
    ids.includes(item.productId)
  );

  userStore.checkout.push(...filteredItems);

  navigateTo("/checkout"); // Ensure navigation works correctly
};
</script>
