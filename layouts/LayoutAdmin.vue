    <template>
      <div id="LayoutAdmin" class="w-full fixed z-50">
        <div id="MainHeader" class="flex items-center w-full bg-[#fafafa] shadow-[0px_1px_5px_3px_rgba(0,_0,_0,_0.25)]">
          <div class="flex lg:justify-between justify-between gap-10 max-w-[1150px] w-full px-3 py-5 mx-auto">
            <!-- Logo with Press and Color Animation -->
            <NuxtLink to="/admin/index1"
              class="min-w-[170px] transform transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95">
              <img width="170" src="/baybayani-logo.png"
                class="transition-colors duration-300 ease-in-out hover:brightness-90" />
            </NuxtLink>






            <!-- Profile Menu with Username Below on Hover -->
            <div id="ProfileMenu" class="md:block hidden pt-3 relative group items-right">
              <ul class="flex items-center justify-end text-sm text-[#333333] font-bold">
                <li class="flex items-center px-2.5 hover:text-[#FF4646] h-full gap-4 cursor-pointer relative">
                  <Icon name="ph:user-light" size="32"
                    class="text-[#0C6539] transition-colors duration-300 ease-in-out group-hover:text-[#FF4646]" />
                  <!-- Username Pop-Up Below -->
                  <div v-if="userStore.user"
                    class="absolute bg-white shadow-md rounded-md py-1 px-3 text-sm text-[#333333] top-full mt-2 transform transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-50">
                    {{ userStore.profile ? `${userStore.profile.name}` : "" }}
                  </div>

                  <template v-if="userStore.user">
                    <button @click="signOut"
                      class="ml-4 bg-[#FF4646] text-white rounded px-3 py-1 font-bold hover:bg-[#d43f3f] transition-colors duration-300 ease-in-out">
                      Logout
                    </button>
                  </template>
                  <template v-else>
                    <NuxtLink to="/login"
                      class="ml-4 bg-[#0C6539] text-white rounded px-3 py-1 font-bold hover:bg-[#218838] transition-colors duration-300 ease-in-out">
                      Login
                    </NuxtLink>
                  </template>
                </li>
              </ul>
            </div>

            <button @click="userStore.isMenuOverlay = true"
              class="md:hidden block rounded-full p-1.5 -mt-[4px] hover:bg-gray-200">
              <Icon name="radix-icons:hamburger-menu" size="33" />
            </button>
          </div>
        </div>

        <div class="absolute bg-white max-w-[580px] w-full mt-11 ml-52 rounded-lg">
          <div v-if="items && items.data" v-for="item in items.data" class="p-1">
            <div class="flex items-center justify-between w-full cursor-default hover:bg-gray-100">
              <div class="flex items-center">
                <img class="rounded-md" width="40" :src="item.url" />
                <div class="truncate ml-2">{{ item.title }}</div>
              </div>
              <div class="truncate">₱{{ item.price }}</div>
            </div>
          </div>
        </div>

      </div>

      <div class="lg:pt-[150px] md:pt-[130px] pt-[80px]" />
      <slot />
    </template>

<script setup>
import { useUserStore } from "~/stores/user";
import { ref, computed, onMounted } from "vue";

const userStore = useUserStore();

await userStore.fetchUser();
//await userStore.fetchCartItems();
//await userStore.fetchOrders();

const items = ref(null);


// Sign out function
const signOut = async () => {
  userStore.logout();
  window.location.reload();
  window.location.href = "/login"; // Redirect to login page after logout
};




</script>
