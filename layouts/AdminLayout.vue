<template>
  <div id="AdminLayout" class="w-full fixed z-50">
    <Loading v-if="isLoading" />


    <div id="MainHeader" class="flex items-center w-full bg-[#fafafa] shadow-[0px_1px_5px_3px_rgba(0,_0,_0,_0.25)]">
      <div class="flex lg:justify-start justify-between gap-10 max-w-[1150px] w-full px-3 py-5 mx-auto">
        <!-- Home Button with Click Event -->


        <div @click="navigateHome" class="flex items-center cursor-pointer">
          <img width="170" src="/baybayani-logo.png"
            class="transition-colors duration-300 ease-in-out hover:brightness-90" />
        </div>


        <div class="ml-10 max-w-[500px] w-full md:block hidden pt-2">
          <div class="relative">
            <div class="flex items-center border-2 border-[#0C6539] rounded-md w-full">
              <input 
                id="main-search"
                name="main-search"
                class="w-full placeholder-gray-400 text-sm pl-3 focus:outline-none"
                :placeholder="`Search a product (Open until ${userStore.formattedClosingTime()} PHT)`" 
                type="text"
                v-model="searchItem" />
              <Icon v-if="isSearching" name="eos-icons:loading" size="25" class="mr-2 animate-spin" />
              <button class="flex items-center h-[100%] p-1.5 px-2 bg-[#0C6539]">
                <Icon name="ph:magnifying-glass" size="20" color="#ffffff" />
              </button>
            </div>
          </div>
        </div>

        <div class="absolute bg-white max-w-[580px] w-full mt-11 ml-52 rounded-lg">
          <div v-if="items && items.data" v-for="item in items.data" class="p-1">


            <!-- <div @click="navigateItem"
                      class="flex items-center justify-between w-full cursor-pointer hover:bg-gray-100">
                      <div class="flex items-center">
                        <img class="rounded-md" width="40" :src="item.url" />
                        <div class="truncate ml-2">{{ item.title }}</div>
                      </div>
                      <div class="truncate">₱{{ item.price }}</div>
                    </div> -->

            <div v-for="item in items.data" :key="item.id" @click="navigateItem(item)"
              class="flex items-center justify-between w-full cursor-pointer hover:bg-gray-100">
              <div class="flex items-center">
                <img class="rounded-md" width="40" :src="item.url" loading="lazy" />
                <div class="truncate ml-2">{{ item.title }}</div>
              </div>
              <div class="truncate">₱{{ item.price }}</div>
            </div>



            <!-- <NuxtLink :to="`/item/${item.id}`"
                      class="flex items-center justify-between w-full cursor-pointer hover:bg-gray-100">
                      <div class="flex items-center">
                        <img class="rounded-md" width="40" :src="item.url" />
                        <div class="truncate ml-2">{{ item.title }}</div>
                      </div>
                      <div class="truncate">₱{{ item.price }}</div>
                    </NuxtLink> -->
          </div>
        </div>
        <!-- 
                <button @click="handleCartClick" class="flex items-center pt-2">
                  <div class="relative md:block hidden transform transition-transform duration-300 ease-in-out hover:scale-105"
                    @mouseenter="isCartHover = true" @mouseleave="isCartHover = false">
                    <span v-if="filteredCartCount > 0"
                      class="absolute flex items-center justify-center -right-[3px] top-0 bg-[#FF4646] h-[17px] min-w-[17px] text-xs text-white px-0.5 rounded-full">
                      {{ filteredCartCount }}
                    </span>
                    <div class="min-w-[40px]">
                      <Icon name="ph:shopping-cart-simple-light" size="33" :color="isCartHover ? '#FF4646' : '0C6539'"
                        class="transition-colors duration-300 ease-in-out" />
                    </div>
                  </div>
                </button>

                -->
        <!-- 
                <NuxtLink to="/shoppingcart" class="flex items-center pt-2">
                  <button class="relative md:block hidden" @mouseenter="isCartHover = true"
                    @mouseleave="isCartHover = false">
                    <span
                      class="absolute flex items-center justify-center -right-[3px] top-0 bg-[#FF4646] h-[17px] min-w-[17px] text-xs text-white px-0.5 rounded-full">
                      {{ userStore.cartItems.length }}
                    </span>
                    <div class="min-w-[40px]">
                      <Icon name="ph:shopping-cart-simple-light" size="33"
                        :color="isCartHover ? '#FF4646' : '0C6539'" />
                    </div>
                  </button>
                </NuxtLink> -->

        <div @click="navigateShoppingCart" class="flex items-center pt-2">
          <button class="relative md:block hidden" @mouseenter="isCartHover = true" @mouseleave="isCartHover = false">
            <span
              class="absolute flex items-center justify-center -right-[3px] top-0 bg-[#FF4646] h-[17px] min-w-[17px] text-xs text-white px-0.5 rounded-full">
              {{ userStore.cartItems.length }}
            </span>
            <div class="min-w-[40px]">
              <Icon name="ph:shopping-cart-simple-light" size="33" :color="isCartHover ? '#FF4646' : '0C6539'" />
            </div>
          </button>
        </div>





        <div @click="navigateOrders" class="flex items-center pt-2">
          <button class="relative md:block hidden" @mouseenter="isOrderHover = true" @mouseleave="isOrderHover = false">
            <span
              class="absolute flex items-center justify-center -right-[3px] top-0 bg-[#FF4646] h-[17px] min-w-[17px] text-xs text-white px-0.5 rounded-full">
              {{userStore.order.filter(order => order.orderStatus === "PENDING" || order.orderStatus ===
                "PROCESSING").length}}
            </span>
            <div class="min-w-[40px]">
              <Icon name="material-symbols-light:shopping-bag-outline" size="36 "
                :color="isOrderHover ? '#FF4646' : '0C6539'" />
            </div>
          </button>
        </div>





        <div class="md:hidden flex items-center">
          <button @click="toggleSearchBar" class="flex items-center cursor-pointer -mr-8 mb-1">
            <Icon name="ph:magnifying-glass" size="28" color="#0C6539" />
          </button>
        </div>

        <div v-show="isSearchVisible"
          class="w-full absolute bg-white border-2 border-[#0C6539] rounded-md shadow-lg mt-16 -ml-3">
          <div class="relative w-full mx-auto">
            <div class="flex items-center border-b border-[#0C6539]">
              <input class="w-full placeholder-gray-400 text-sm pl-3 focus:outline-none"
                :placeholder="`Search a product (Open until ${userStore.formattedClosingTime()} PHT)`" type="text"
                v-model="searchItem" />
              <Icon v-if="isSearching" name="eos-icons:loading" size="25" class="mr-2 animate-spin" />
              <button class="flex items-center h-[100%] p-1.5 px-2 bg-[#0C6539]">
                <Icon name="ph:magnifying-glass" size="20" color="#ffffff" />
              </button>
            </div>

            <div v-if="items && items.data" class="max-h-[300px] overflow-y-auto">
              <div v-for="item in items.data" :key="item.id" class="p-2 hover:bg-gray-100">
                <NuxtLink :to="`/item/${item.id}`" class="flex items-center justify-between cursor-pointer">
                  <div class="flex items-center">
                    <img class="rounded-md" width="40" :src="item.url" loading="lazy" />
                    <div class="truncate ml-2">{{ item.title }}</div>
                  </div>
                  <div class="truncate">₱{{ item.price }}</div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Menu with Username Below on Hover -->
        <div id="ProfileMenu" class="md:block hidden pt-3 relative group">
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
          <Icon name="radix-icons:hamburger-menu" size="32" class="text-[#0C6539]" />
        </button>
      </div>
    </div>
  </div>

  <div class="lg:pt-32 md:pt-32 pt-[100px] px-4" />
  <div class="pb-12 pt-5 px-3 md:pt-2 md:pb-16 lg:pb-20 lg:pt-2">
    <slot />
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";
import { ref, computed, onMounted, watchEffect } from "vue";

const userStore = useUserStore();
userStore.isLoading = false;

const isCartHover = ref(false);
const isOrderHover = ref(false);
const isSearching = ref(false);
const searchItem = ref("");
const items = ref(null);
const isSearchVisible = ref(false); // Track visibility of the search bar
const searchBarRef = ref(null);  // Reference to the search bar element
const isLoading = ref(true); // Loading state



const toggleSearchBar = () => {
  // console.log('Toggling search bar visibility');
  if (isSearchVisible.value) {
    items.value = null;  // Clear the search results when closing the search bar
  }
  isSearchVisible.value = !isSearchVisible.value; // Toggle visibility
};

const closeSearchBar = (event) => {
  // Check if the clicked target is outside the search bar or the search button
  if (searchBarRef.value && !searchBarRef.value.contains(event.target) && !event.target.closest('.ph:magnifying-glass')) {
    isSearchVisible.value = false;
    items.value = null;  // Clear the search results when closing the search bar
  }
};


// const closeSearchBar = (event) => {
//   if (searchBarRef.value && !searchBarRef.value.contains(event.target) && !event.target.closest('.ph:magnifying-glass')) {
//     isSearchVisible.value = false;
//   }
// };


// Safely filter cart items count
const filteredCartCount = computed(() => {
  return userStore.cartItems.filter((item) => {
    if (!item.product) {
      console.warn("Cart item is missing product:", item);
      return false; // Exclude invalid items
    }
    return item.product.hidden === false && item.product.isDeleted === false;
  }).length;
});

await userStore.fetchUser();
await userStore.fetchCartItems();
await userStore.fetchOrders();
userStore.isLoading = false;
//console.log("THIS FUNCTION IS USED");
//console.log(userStore.isLoading);

// Sign out function
const signOut = async () => {
  userStore.logout();
  window.location.href = "/login"; // Redirect to login page after logout
};

const searchByName = useDebounce(async () => {
  if (!searchItem.value) {
    // If the searchItem is empty, don't perform the fetch or search
    items.value = []; // Clear the results
    isSearching.value = false;
    return;
  }

  // Proceed with fetching the search results only if the searchItem has a value
  isSearching.value = true;
  try {
    items.value = await useFetch(`/api/prisma/search-by-name/${searchItem.value}`);
  } catch (error) {
    console.error("Error fetching search results:", error);
  } finally {
    isSearching.value = false;
  }
}, 500);

watch(
  () => searchItem.value,
  () => {
    searchByName();
  }
);
const handleProductClick = (product) => {
  //console.log("Product clicked:", product);
  window.location.href = `/item/${product.id}`;
};

// CometChat Docked Widget Integration
onMounted(() => {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false; // End loading after delay
  }, 500); // 500ms delay
  document.addEventListener("click", closeSearchBar);

  // Initialize CometChat for all non-admin users
  if (!userStore.isAdmin()) {
    const defaultUID = userStore.profile?.name
      ? userStore.profile.name.replace(/\s+/g, "").toLowerCase()
      : null;

    if (defaultUID) {
      const script = document.createElement("script");
      script.src = "https://widget-js.cometchat.io/v3/cometchatwidget.js";
      script.defer = true;

      script.onload = () => {
        initializeCometChatWidget(defaultUID);
      };
      document.body.appendChild(script);
    }
  }
});

const initializeCometChatWidget = (defaultUID) => {
  console.log("Initializing CometChat for user:", defaultUID);
  
  CometChatWidget.init({
    appID: "267505e7582e8c70",
    appRegion: "us",
    authKey: "aab766213fba5c11e11ede09f1f0d0d0735dd6f9",
  })
    .then(() => {
      console.log("CometChat initialization completed successfully");

      CometChatWidget.login({
        uid: defaultUID,
      })
        .then(() => {
          console.log("CometChat user login successful");

          CometChatWidget.launch({
            widgetID: "ce919709-5388-4331-a9c4-64c5ced133f5",
            docked: "true",
            alignment: "left",
            roundedCorners: "true",
            height: "450px",
            width: "400px",
            defaultID: "baybayaniadmin", // Always set admin as the default chat target
            defaultType: "user",
          });
        })
        .catch((error) => {
          console.error("CometChat user login failed:", error);
        });
    })
    .catch((error) => {
      console.error("CometChat initialization failed:", error);
    });
};

const navigateHome = () => {
  window.location.href = `/`;
};


const navigateShoppingCart = () => {
  window.location.href = `/shoppingcart`;
};

const navigateOrders = () => {
  window.location.href = `/orders`;
};


const navigateItem = (item) => {
  // Ensure the item has an id before navigating
  if (item && item.id) {
    window.location.href = `/item/${item.id}`;
  } else {
    console.warn('Item or item.id is undefined');
  }
};



</script>
<style scoped>
/* Improved mobile styles */
@media (max-width: 767px) {

  /* Better spacing for search results dropdown */
  .absolute.bg-white.max-w-\[580px\].w-full.mt-11.ml-52.rounded-lg {
    margin-left: 0;
    width: 100%;
    left: 0;
    right: 0;
    margin-top: 60px;
  }

  /* Adjust the search bar position */
  .w-full.absolute.bg-white.border-2.border-\[\#0C6539\].rounded-md.shadow-lg.mt-16.-ml-3 {
    margin-top: 60px;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 40;
  }

  /* Ensure product cards in search results have padding */
  .p-1 {
    padding: 8px 12px;
  }
}

/* General improvements for mobile */
#AdminLayout {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
}

/* Add this to your global CSS for product cards */
@media (max-width: 767px) {
  .product-card {
    margin-top: 12px;
    margin-bottom: 12px;
  }

  .product-grid {
    padding-top: 8px;
    padding-bottom: 8px;
  }
}
</style>