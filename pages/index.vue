<template>
  <AdminLayout>
    <div id="IndexPage" class="max-w-[1200px] mx-auto px-2">
      <div class="grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4">
        <div v-if="filteredProducts" v-for="product in filteredProducts" :key="product.id"
          class="transition-all duration-500 ease-in-out transform hover:scale-105 group rounded-md overflow-hidden"
          @click="handleProductClick(product)">
          <div
            class="transition-all duration-500 ease-in-out group-hover:saturate-150 group-hover:shadow-lg group-hover:bg-white group-hover:-translate-y-1 rounded-md">
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
import { useRoute } from "vue-router";
const user = useSupabaseUser();

const userStore = useUserStore();

let products = ref(null);

const route = useRoute();
const role = userStore.profile?.role;

watchEffect(() => {
  if (route.fullPath == "/" &&
    (!user.value || role === "Admin")) {
    navigateTo("/admin/dashboard");
  }
  else if (route.fullPath == "/" && !user.value) {
    navigateTo("/login");
  }
});

onBeforeMount(async () => {
  products.value = await useFetch("/api/prisma/get-all-products");
  setTimeout(() => (userStore.isLoading = true), 1000);
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

const handleProductClick = (product) => {
  // console.log("Product clicked:", product);
  window.location.href = `/item/${product.id}`
};

// CometChat Docked Widget Integration
onMounted(() => {
  const defaultUID = userStore.profile?.name
    ? userStore.profile.name.replace(/\s+/g, "").toLowerCase()
    : "defaultuid";

  const script = document.createElement("script");
  script.src = "https://widget-js.cometchat.io/v3/cometchatwidget.js";
  script.defer = true;

  script.onload = () => {
    initializeCometChatWidget(defaultUID);
  };
  document.body.appendChild(script);
});

const initializeCometChatWidget = (defaultUID) => {
  CometChatWidget.init({
    appID: "267505e7582e8c70",
    appRegion: "us",
    authKey: "aab766213fba5c11e11ede09f1f0d0d0735dd6f9",
  })
    .then(() => {
      //  console.log("Initialization completed successfully");

      CometChatWidget.login({
        uid: defaultUID,
      })
        .then(() => {
          //  console.log("User login successful");

          CometChatWidget.launch({
            widgetID: "ce919709-5388-4331-a9c4-64c5ced133f5",
            docked: "true",
            alignment: "left",
            roundedCorners: "true",
            height: "450px",
            width: "400px",
            defaultID: defaultUID,
            defaultType: "user",
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
