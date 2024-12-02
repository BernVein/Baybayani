<template>
    <div class="flex h-screen">
        <!-- Sidebar Layout -->
        <SideBarLayout
            class="sidebar fixed lg:relative lg:transform lg:translate-x-0 lg:w-64 w-64 transform -translate-x-full transition-transform duration-300 ease-in-out lg:shadow-none shadow-lg"
            :class="{ 'translate-x-0': isSidebarOpen, '-translate-x-full': !isSidebarOpen }" />

        <!-- Main Content Area (LayoutAdmin) -->
        <LayoutAdmin class="flex-1 overflow-auto">
            <div id="IndexPage" class="max-w-[1500px] mx-auto px-2 mt-24">
                <!-- Box Container for Products -->
                <div class="product-box p-4 bg-white shadow-lg rounded-md mb-6">
                    <div class="text-lg font-semibold mb-4">Products View</div>

                    <!-- Product Grid inside the Box -->
                    <div class="grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4 overflow-y-auto"
                        style="max-height: calc(100vh - 180px)">
                        <div v-if="filteredProducts" v-for="product in filteredProducts" :key="product.id"
                            class="transition-all duration-500 ease-in-out transform group rounded-md overflow-hidden"
                            @click.stop.prevent="clickDisabled ? null : handleProductClick(product)">
                            <!-- Disable click here -->
                            <div
                                class="transition-all duration-500 ease-in-out group-hover:saturate-150 group-hover:shadow-lg group-hover:bg-white group-hover:-translate-y-1 rounded-md">
                                <ProductComponent :product="product" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LayoutAdmin>
    </div>
</template>


<script setup>
import LayoutAdmin from "~/layouts/LayoutAdmin.vue";
import SideBarLayout from "~/layouts/SideBarLayout.vue";
import { useUserStore } from "~/stores/user";
import { ref, onBeforeMount, computed } from "vue";
import { useRouter } from "vue-router";
const clickDisabled = ref(true); // Set to true to disable clicking


const userStore = useUserStore();
const router = useRouter();

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};


let products = ref(null);

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

// CometChat Docked Widget Integration
onMounted(() => {
    userStore.fetchCartItems();

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
            console.log("Initialization completed successfully");

            CometChatWidget.login({
                uid: defaultUID,
            })
                .then(() => {
                    console.log("User login successful");

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
