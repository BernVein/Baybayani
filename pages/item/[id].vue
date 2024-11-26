<template>
  <AdminLayout>
    <!--   <Loading v-if="userStore.isLoading" />    -->

    <div id="ItemPage" class="mt-4 max-w-[1200px] mx-auto px-2">
      <div class="flex gap-10 justify-between mx-auto w-full">
        <!-- Left Section: Images -->
        <div class="w-[40%]">
          <div class="flex flex-col">
            <img v-if="currentImage"
              class="rounded-lg object-cover w-full h-[400px] transition-transform duration-500 ease-in-out hover:scale-105 hover:shadow-2xl"
              :src="currentImage" alt="Product Image" />
            <div class="flex mt-4 gap-4">
              <!-- Placeholder for additional images -->
              <img v-for="(image, index) in images" :key="index" :src="image"
                class="h-20 w-20 object-cover rounded-lg border cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110 hover:border-green-500"
                @click="currentImage = image" alt="Thumbnail" />
            </div>
          </div>
        </div>

        <!-- Right Section: Product Details -->
        <div class="w-[50%] bg-white p-6 rounded-lg shadow-md transition-all duration-500 ease-in-out hover:shadow-lg">
          <div v-if="product && product.data">
            <!-- Product Title -->
            <h1
              class="text-4xl font-semibold text-gray-800 transition-colors duration-300 ease-in-out hover:text-green-600">
              {{ product.data.title }}
            </h1>

            <!-- Product Price -->
            <div
              class="text-3xl font-bold p-2 text-red-500 transition-colors duration-300 ease-in-out hover:text-red-600">
              ₱{{ product.data.price }} / kg
            </div>

            <!-- Product Description -->
            <p class="mt-6 font-light text-lg text-gray-600">Product Details:</p>
            <p class="text-md text-gray-700 mb-4 transition-colors duration-300 ease-in-out hover:text-gray-900">
              {{ product.data.description }}
            </p>

            <!-- Buttons -->
            <div class="flex gap-4 mt-8">
              <button @click="addToCart" :disabled="isInCart"
                class="px-6 py-3 rounded-lg text-white text-lg font-semibold bg-green-600 hover:bg-green-700 transition-transform duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="isInCart">Added to Cart</span>
                <span v-else>Add to Cart</span>
              </button>
              <button
                class="px-6 py-3 rounded-lg text-green-600 border border-green-600 text-lg font-semibold hover:bg-green-50 transition-transform duration-300 ease-in-out hover:scale-105">
                Chat Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from "~/layouts/AdminLayout.vue";
import { useUserStore } from "~/stores/user";
import { ref, computed, onBeforeMount, watchEffect } from "vue";

const userStore = useUserStore();
const route = useRoute();



let product = ref(null);
let currentImage = ref(null);
let images = ref([]);
let addtocartResponse = ref(null);

onBeforeMount(async () => {
  product.value = await useFetch(
    `/api/prisma/get-product-by-id/${route.params.id}`
  );
});

watchEffect(() => {
  if (product.value && product.value.data) {
    currentImage.value = product.value.data.url;
    images.value = [product.value.data.url]; // Add more images here if available
    userStore.isLoading = false;
  }
});

const isInCart = computed(() => {
  const currentProductId = route.params.id;
  return userStore.cartItems.some((prod) => {
    return String(prod.productId) === String(currentProductId);
  });
});

const addToCart = async () => {
  if (!product.value || !userStore.user) return;

  const productData = product.value.data;
  const userId = userStore.user.id;

  // Check if the product is already in the cart
  const productInCart = userStore.cartItems.some(
    (item) => String(item.productId) === String(productData.id)
  );

  if (productInCart) return;

  userStore.isLoading = true;

  userStore.cartItems.push({
    productId: productData.id,
    quantity: 1, // Default quantity of 1
    productTitle: productData.title,
    productPrice: productData.price,
    productUrl: productData.url,
  });

  try {
    addtocartResponse.value = await useFetch(
      `/api/prisma/add-product-to-cart/${userId}`,
      {
        method: "POST",
        body: {
          userId,
          productId: productData.id,
          quantity: 1, // Default quantity of 1
        },
      }
    );

    userStore.refreshFlag = 1;
    await userStore.fetchCartItems();
  } catch (error) {
    console.error("Error adding product to cart:", error);
  } finally {
    userStore.isLoading = false;
  }
};
</script>
