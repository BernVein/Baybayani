<template>
  <div id="AdminLayout" class="w-full fixed z-50">
    <div id="MainHeader" class="flex items-center w-full bg-[#fafafa] shadow-[0px_1px_5px_3px_rgba(0,_0,_0,_0.25)]">
      <div class="flex lg:justify-start justify-between gap-10 max-w-[1150px] w-full px-3 py-5 mx-auto">
        <!-- Logo -->
        <NuxtLink to="/" class="min-w-[170px] transform transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95">
          <img width="170" src="/baybayani-logo.png" class="transition-colors duration-300 ease-in-out hover:brightness-90" />
        </NuxtLink>

        <!-- Search Bar -->
        <div class="max-w-[700px] w-full md:block hidden pt-2">
          <div class="relative">
            <div class="flex items-center border-2 border-[#0C6539] rounded-md w-full">
              <input
                class="w-full placeholder-gray-400 text-sm pl-3 focus:outline-none"
                placeholder="Search a product"
                type="text"
                v-model="searchItem"
              />
              <Icon v-if="isSearching" name="eos-icons:loading" size="25" class="mr-2 animate-spin" />
              <button class="flex items-center h-[100%] p-1.5 px-2 bg-[#0C6539]">
                <Icon name="ph:magnifying-glass" size="20" color="#ffffff" />
              </button>
            </div>
          </div>
        </div>

        <!-- Cart -->
        <button @click="handleCartClick" class="flex items-center pt-2">
          <div class="relative md:block hidden transform transition-transform duration-300 ease-in-out hover:scale-105">
            <span
              v-if="filteredCartCount > 0"
              class="absolute flex items-center justify-center -right-[3px] top-0 bg-[#FF4646] h-[17px] min-w-[17px] text-xs text-white px-0.5 rounded-full"
            >
              {{ filteredCartCount }}
            </span>
            <Icon name="ph:shopping-cart-simple-light" size="33" :color="isCartHover ? '#FF4646' : '0C6539'" class="transition-colors duration-300 ease-in-out" />
          </div>
        </button>

        <!-- Profile Menu -->
        <div id="ProfileMenu" class="md:block hidden pt-3 relative group">
          <ul class="flex items-center justify-end text-sm text-[#333333] font-bold">
            <li class="flex items-center px-2.5 hover:text-[#FF4646] h-full gap-4 cursor-pointer relative">
              <Icon name="ph:user-light" size="32" class="text-[#0C6539] transition-colors duration-300 ease-in-out group-hover:text-[#FF4646]" />
              <div
                v-if="userStore.user"
                class="absolute bg-white shadow-md rounded-md py-1 px-3 text-sm text-[#333333] top-full mt-2 transform transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-50"
              >
                {{ userStore.profile ? `${userStore.profile.name}` : "" }}
              </div>
              <template v-if="userStore.user">
                <button
                  @click="signOut"
                  class="ml-4 bg-[#FF4646] text-white rounded px-3 py-1 font-bold hover:bg-[#d43f3f] transition-colors duration-300 ease-in-out"
                >
                  Logout
                </button>
              </template>
              <template v-else>
                <NuxtLink to="/login" class="ml-4 bg-[#0C6539] text-white rounded px-3 py-1 font-bold hover:bg-[#218838] transition-colors duration-300 ease-in-out">
                  Login
                </NuxtLink>
              </template>
            </li>
          </ul>
        </div>

        <button @click="userStore.isMenuOverlay = true" class="md:hidden block rounded-full p-1.5 -mt-[4px] hover:bg-gray-200">
          <Icon name="radix-icons:hamburger-menu" size="33" />
        </button>
      </div>
    </div>

    <!-- Render Child Content -->
    <div v-if="userStore.user">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";
import { ref, computed, onMounted } from "vue";

// Reactive State
const userStore = useUserStore();
let isCartHover = ref(false);
let isSearching = ref(false);
let searchItem = ref("");

// Computed: Filtered Cart Count with Guard
const filteredCartCount = computed(() => {
  return userStore.cartItems.filter((item) => {
    if (!item.product) {
      console.warn("Cart item is missing product:", item);
      return false; // Exclude this item
    }
    return !item.product.hidden && !item.product.isDeleted;
  }).length;
});

// Fetch User and Cart Items on Mount
onMounted(async () => {
  console.log("AdminLayout mounted...");
  await userStore.fetchUser();
  await userStore.fetchCartItems();
  console.log("Cart items fetched:", userStore.cartItems);
});

// Sign Out Functionality
const signOut = async () => {
  userStore.logout();
};

// Handle Cart Button Click
const handleCartClick = () => {
  if (!userStore.user) {
    window.location.href = "/login";
  } else {
    window.location.href = "/shoppingcart";
  }
};
</script>
