<template>
  <AdminLayout>
    <div id="ItemPage" class="mt-4 max-w-[1200px] mx-auto px-2">
      <div class="flex gap-10 justify-between mx-auto w-full">
        <!-- Left Section: Images -->
        <div class="w-[40%]">
          <div class="flex flex-col">
            <img v-if="currentImage"
              class="rounded-lg object-cover w-full h-[400px] transition-transform duration-500 ease-in-out hover:scale-105 hover:shadow-2xl"
              :src="currentImage" alt="Product Image" />
            <div class="flex mt-4 gap-4">
              <img v-for="(image, index) in images" :key="index" :src="image"
                class="h-20 w-20 object-cover rounded-lg border cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110 hover:border-green-500"
                @click="currentImage = image" alt="Thumbnail" />
            </div>
          </div>
        </div>

        <!-- Right Section: Product Details -->
        <div class="w-[50%] bg-white p-6 rounded-lg shadow-md transition-all duration-500 ease-in-out hover:shadow-lg">
          <div v-if="product && product.data">
            <h1
              class="text-4xl font-semibold text-gray-800 transition-colors duration-300 ease-in-out hover:text-green-600">
              {{ product.data.title }}
            </h1>
            <div
              class="text-3xl font-bold p-2 text-red-500 transition-colors duration-300 ease-in-out hover:text-red-600">
              ₱{{ product.data.price }} / kg
            </div>
            <p class="mt-6 font-light text-lg text-gray-600">Product Details:</p>
            <p class="text-md text-gray-700 mb-4 transition-colors duration-300 ease-in-out hover:text-gray-900">
              {{ product.data.description }}
            </p>
            <div class="flex gap-4 mt-8">
              <button @click="addToCart" :disabled="isInCart"
                class="px-6 py-3 rounded-lg text-white text-lg font-semibold bg-green-600 hover:bg-green-700 transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">

                <!-- Text when item is in cart -->
                <span v-if="isInCart" class="transition-opacity duration-300 ease-in-out">Added to Cart</span>

                <!-- Text when item is not in cart -->
                <span v-else class="transition-opacity duration-300 ease-in-out">Add to Cart</span>

                <!-- Icon when item is in cart -->
                <Icon v-if="isInCart" name="mynaui:cart-check" size="30"
                  class="ml-2 transition-all duration-300 ease-in-out transform scale-110" />

                <!-- Icon when item is not in cart -->
                <Icon v-else name="mynaui:cart-plus" size="30"
                  class="ml-2 transition-all duration-300 ease-in-out transform scale-110" />
              </button>

              <button @click="openChatModal"
                class="px-6 py-3 rounded-lg text-blue-600 border border-blue-600 text-lg font-semibold hover:bg-blue-50 transition-transform duration-300 ease-in-out hover:scale-105 flex items-center">
                <span class="mr-2">Chat Seller</span>
                <Icon name="mynaui:message" size="25" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Pop-up -->
      <div v-if="showChatModal" class="modal-overlay">
        <div class="modal-content">
          <p>The chat bubble can be seen at the bottom left of the screen.</p>
          <button @click="closeChatModal" class="close-modal-button">Got it!</button>
        </div>
      </div>

      <!-- Rectangle Animation -->
      <div v-if="showGuidedLine" class="rectangle-animation"></div>
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
let showChatModal = ref(false);
let showGuidedLine = ref(false);

onBeforeMount(async () => {
  product.value = await useFetch(`/api/prisma/get-product-by-id/${route.params.id}`);
});

watchEffect(() => {
  if (product.value && product.value.data) {
    currentImage.value = product.value.data.url;
    images.value = [product.value.data.url];
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

  const productInCart = userStore.cartItems.some(
    (item) => String(item.productId) === String(productData.id)
  );

  if (productInCart) return;

  userStore.isLoading = true;

  userStore.cartItems.push({
    productId: productData.id,
    quantity: 1,
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
          quantity: 1,
        },
      }
    );

    userStore.refreshFlag = 1;
    //await userStore.fetchCartItems();
  } catch (error) {
    console.error("Error adding product to cart:", error);
  } finally {
    userStore.isLoading = false;
  }
};

const openChatModal = () => {
  showChatModal.value = true;
  showGuidedLine.value = true; // Start the animation when the chat modal is opened
  setTimeout(() => {
    showGuidedLine.value = false;
  }, 3000); // Show the rectangle for 3 seconds
};

const closeChatModal = () => {
  showChatModal.value = false;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  color: #333;
  max-width: 300px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.close-modal-button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.close-modal-button:hover {
  background-color: #0056b3;
}

.rectangle-animation {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 0;
  height: 0;
  border: 4px solid #007bff;
  animation: drawAndFadeRectangle 3s forwards;
  z-index: 1000;
}

@keyframes drawAndFadeRectangle {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }

  50% {
    width: 300px;
    height: 0;
    opacity: 1;
  }

  75% {
    width: 300px;
    height: 200px;
    opacity: 1;
  }

  100% {
    width: 300px;
    height: 200px;
    opacity: 0;
  }
}
</style>
