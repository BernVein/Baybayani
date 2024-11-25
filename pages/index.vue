<template>
  <AdminLayout>
    <div id="IndexPage" class="max-w-[1200px] mx-auto px-2">
      <div
        class="grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4"
      >
        <div
          v-if="filteredProducts"
          v-for="product in filteredProducts"
          :key="product.id"
          class="transition-all duration-500 ease-in-out transform hover:scale-105 group rounded-md overflow-hidden"
          @click="handleProductClick(product)"
        >
          <div
            class="transition-all duration-500 ease-in-out group-hover:saturate-150 group-hover:shadow-lg group-hover:bg-white group-hover:-translate-y-1 rounded-md"
          >
            <ProductComponent :product="product" />
          </div>
        </div>
      </div>
    </div>
    <!-- CometChat Docked Widget -->
  </AdminLayout>
</template>

<script setup>
import AdminLayout from "~/layouts/AdminLayout.vue";
import { useUserStore } from "~/stores/user";
import { ref, onBeforeMount, computed } from "vue";
import { useRouter } from "vue-router";

// User and Product Setup
const userStore = useUserStore();
const user = useSupabaseUser();
const route = useRoute();
const router = useRouter();

console.log("UserStore as JSON:", JSON.stringify(userStore.$state, null, 2));
console.log(userStore.profile?.name);

watchEffect(() => {
  console.log("IsAdmin??");
  console.log(userStore.isAdmin === true);
  if (route.fullPath == "/" && userStore.isAdmin === true) {
    navigateTo("/admin/dashboard");
  }
});

let products = ref(null);

onBeforeMount(async () => {
  products.value = await useFetch("/api/prisma/get-all-products");
  setTimeout(() => (userStore.isLoading = false), 1000);
});

// Compute filtered products to exclude hidden and deleted products
const filteredProducts = computed(() => {
  if (products.value && products.value.data) {
    return products.value.data.filter(
      (product) => !product.hidden && !product.isDeleted
    );
  }
  return [];
});

// CometChat Docked Widget Integration
onMounted(() => {
  // Extract and format the user's name to remove spaces
  const defaultUID = userStore.profile?.name
  ? userStore.profile.name.replace(/\s+/g, "").toLowerCase() // Remove spaces and convert to lowercase
  : "defaultuid"; // Fallback if the name is unavailable
  

  console.log("Default UID:", defaultUID);

  // Load the CometChat Widget script dynamically
  const script = document.createElement("script");
  script.src = "https://widget-js.cometchat.io/v3/cometchatwidget.js";
  script.defer = true;

  script.onload = () => {
    initializeCometChatWidget(defaultUID); // Pass the UID dynamically
  };
  document.body.appendChild(script);
});

const initializeCometChatWidget = (defaultUID) => {
  CometChatWidget.init({
    appID: "267505e7582e8c70", // Your App ID
    appRegion: "us",           // Your App Region
    authKey: "aab766213fba5c11e11ede09f1f0d0d0735dd6f9", // Your Auth Key
  })
    .then(() => {
      console.log("Initialization completed successfully");

      // Log in a user
      CometChatWidget.login({
        uid: defaultUID, // Use the dynamic UID
      })
        .then(() => {
          console.log("User login successful");

          // Launch the widget in a docked layout
          CometChatWidget.launch({
            widgetID: "ce919709-5388-4331-a9c4-64c5ced133f5", // Replace with your Widget ID
            docked: "true",         // Enable docked layout
            alignment: "left",      // Choose "left" or "right"
            roundedCorners: "true", // Enable rounded corners
            height: "450px",        // Widget height
            width: "400px",         // Widget width
            defaultID: defaultUID,  // Dynamic UID
            defaultType: "user",    // "user" for one-on-one chat, "group" for group chats
          });
        })
        .catch((error) => {
          console.error("User login failed:", error);
        });
    })
    .catch((error) => {
      console.error("Widget initialization failed:", error);
    });
};
</script>

<style>
/* No additional styles needed for the CometChat Docked Widget */
</style>
