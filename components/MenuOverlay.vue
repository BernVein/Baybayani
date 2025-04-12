<template>
  <div id="MenuOverlay" class="fixed z-50 bottom-0 h-full w-full bg-white px-3">
    <div class="flex items-center justify-between py-5">
      <NuxtLink to="/" @click="userStore.isMenuOverlay = false">
        <img width="170" src="/baybayani-logo.png" />
      </NuxtLink>

      <button @click="userStore.isMenuOverlay = false" class="rounded-full p-1 hover:bg-gray-200">
        <Icon name="mdi:close" size="30" />
      </button>
    </div>

    <!-- Store Hours Display -->
    <div class="flex items-center justify-center mb-4 bg-gray-100 py-2 rounded-md">
      <div class="flex flex-col items-center text-[#0C6539]">
        <div class="flex items-center">
          <Icon name="mdi:clock-outline" size="18" class="mr-1" />
          <span>{{ currentTime }}</span>
        </div>
        <div class="text-xs">Open until 10:00 PM</div>
      </div>
    </div>

    <div class="flex items-center justify-between pt-5">
      <ul class="w-full">
        <li @click="goTo('orders')"
          class="relative flex items-center justify-between py-2.5 border-b px-3 hover:bg-gray-100 cursor-pointer">
          <div class="flex items-center text-[20px] font-semibold">
            <Icon name="ph:pen-light" size="33" />
            <span class="pl-4">My Orders</span>
          </div>
        </li>

        <li @click="goTo('shoppingcart')"
          class="relative flex items-center justify-between py-2.5 border-b px-3 hover:bg-gray-100 cursor-pointer">
          <div class="flex items-center text-[20px] font-semibold">
            <Icon name="ph:shopping-cart-simple-light" size="33" />
            <span class="pl-4">Cart</span>
          </div>
        </li>

        <li v-if="user" @click="signOut()"
          class="relative flex items-center justify-between py-2.5 border-b px-3 hover:bg-gray-100 cursor-pointer">
          <div class="flex items-center text-[20px] font-semibold">
            <Icon name="ph:sign-out-light" size="33" />
            <span class="pl-4">Sign out</span>
          </div>
        </li>

        <li v-else @click="signIn()"
          class="relative flex items-center justify-between py-2.5 border-b px-3 hover:bg-gray-100 cursor-pointer">
          <div class="flex items-center text-[20px] font-semibold">
            <Icon name="ph:sign-in-light" size="33" />
            <span class="pl-4">Sign In</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";
const userStore = useUserStore();

const client = useSupabaseClient();
const user = useSupabaseUser();
let currentTime = ref('');

// Update current time every 30 seconds
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  updateTime();
  setInterval(updateTime, 30000);
});

const goTo = (url) => {
  userStore.isMenuOverlay = false;
  window.location.href = `/${url}`;
};

const signOut = () => {
  userStore.logout();
  //client.auth.signOut();
  //userStore.isMenuOverlay = false;
  // return navigateTo("/login");
  window.location.href = "/login";
};

const signIn = () => {
  userStore.isMenuOverlay = false;
  // return navigateTo("/login");
  window.location.href = "/login";
};
</script>
