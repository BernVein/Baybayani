<template>
  <AdminLayout>
    <Loading v-if="isLoading" />
    <div id="ItemPage" class="max-w-[1200px] mx-auto px-4">
      <!-- Breadcrumb -->
      <nav class="mb-6 flex items-center text-sm  text-gray-500">
        <NuxtLink to="/" class="hover:text-green-600 transition-colors">Home</NuxtLink>
        <span class="mx-2">›</span>
        <span class="text-gray-800 font-medium">{{ product?.data?.title || 'Product Details' }}</span>
      </nav>

      <div class="flex flex-col lg:flex-row gap-10 justify-between mx-auto w-full">
        <!-- Left Section: Images -->
        <div class="w-full lg:w-[45%]">
          <div class="sticky top-24">
            <div class="relative group">
              <img v-if="currentImage"
                class="rounded-2xl object-cover w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] transition-all duration-500 ease-in-out shadow-lg group-hover:shadow-2xl"
                :src="currentImage" :alt="product?.data?.title" />

              <div
                class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded-2xl">
              </div>

              <div v-if="product?.data?.stock <= 0"
                class="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full font-semibold shadow-lg text-sm sm:text-base">
                Out of Stock
              </div>
            </div>

            <div class="flex mt-4 sm:mt-6 gap-2 sm:gap-4 overflow-x-auto py-2 px-1">
              <img v-for="(image, index) in images" :key="index" :src="image"
                class="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-cover rounded-lg border-2 cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 flex-shrink-0"
                :class="currentImage === image ? 'border-green-500 shadow-lg' : 'border-transparent'"
                @click="currentImage = image" :alt="`${product?.data?.title} thumbnail ${index + 1}`" />
            </div>
          </div>
        </div>


        <!-- Right Section: Product Details -->
        <!-- <div class="w-full lg:w-[55%]">
          <div v-if="product && product.data" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div class="space-y-4">
              <h1 class="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                {{ product.data.title }}
              </h1>
              <div class="flex items-center justify-between">
                <div class="text-2xl lg:text-3xl font-bold text-green-600">
                  ₱{{ product.data.price }} <span class="text-lg text-gray-500 font-normal">per kg</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="h-3 w-3 rounded-full" :class="product.data.stock > 0 ? 'bg-green-500' : 'bg-red-500'">
                  </div>
                  <span :class="product.data.stock > 0 ? 'text-green-600' : 'text-red-500'" class="font-medium">
                    {{ product.data.stock > 0 ? `${product.data.stock} kg available` : 'Out of Stock' }}
                  </span>
                </div>
              </div>
            </div> -->
        <!-- Right Section: Product Details -->
        <div class="w-full lg:w-[55%]">
          <div v-if="product && product.data"
            class="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <!-- Title and Price -->
            <div class="space-y-3 sm:space-y-4">
              <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                {{ product.data.title }}
              </h1>

              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <!-- Price - Stacked on mobile, row on larger screens -->
                <div class="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">
                  ₱{{ product.data.price }}
                  <span class="text-base sm:text-lg text-gray-500 font-normal">per kg</span>
                </div>

                <!-- Stock Status - Better mobile layout -->
                <div class="flex items-center gap-2">
                  <div class="h-2.5 sm:h-3 w-2.5 sm:w-3 rounded-full flex-shrink-0"
                    :class="product.data.stock > 0 ? 'bg-green-500' : 'bg-red-500'">
                  </div>
                  <span :class="product.data.stock > 0 ? 'text-green-600' : 'text-red-500'"
                    class="text-sm sm:text-base font-medium whitespace-nowrap">
                    {{ product.data.stock > 0 ? `${product.data.stock} kg available` : 'Out of Stock' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="mt-8">
              <h2 class="text-lg font-semibold text-gray-800 mb-3">Product Details</h2>
              <p class="text-gray-600 leading-relaxed">
                {{ product.data.description }}
              </p>
            </div>

            <!-- Quantity Selector -->
            <!-- <div class="mt-8 space-y-4 md:space-y-6 lg:space-y-8">
              <div class="flex items-center gap-4">
                <label class="font-medium text-gray-700">Quantity:</label>
                <div class="flex items-center bg-gray-50 rounded-lg border border-gray-200"
                  :class="{ 'border-red-500': parseFloat(inputQuantity) > product.data.stock }">
                  <button @click="decreaseQuantity"
                    class="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-l-lg transition-colors"
                    :disabled="parseFloat(inputQuantity) <= 0.25 || product.data.stock <= 0">
                    <Icon name="material-symbols:remove" size="20" />
                  </button>
                  <input type="text"
                    class="w-20 h-12 text-center bg-transparent border-x border-gray-200 text-lg font-medium"
                    v-model="inputQuantity" @input="validateInput" @blur="validateAndUpdateQuantity"
                    @keydown="preventInvalidInput" :disabled="product.data.stock <= 0"
                    :class="{ 'text-red-500': parseFloat(inputQuantity) > product.data.stock }" />
                  <button @click="increaseQuantity"
                    class="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-r-lg transition-colors"
                    :disabled="product.data.stock <= parseFloat(inputQuantity) || product.data.stock <= 0">
                    <Icon name="material-symbols:add" size="20" />
                  </button>
                </div>
                <span class="text-sm text-gray-500">kg</span>
              </div> -->

            <div class="mt-8 space-y-4 md:space-y-6 lg:space-y-8">
              <div class="flex items-center gap-4">
                <label class="font-medium text-gray-700 text-sm sm:text-base">Quantity:</label>
                <div class="flex items-center bg-gray-50 rounded-lg border border-gray-200"
                  :class="{ 'border-red-500': parseFloat(inputQuantity) > product.data.stock }">
                  <button @click="decreaseQuantity"
                    class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-l-lg transition-colors"
                    :disabled="parseFloat(inputQuantity) <= 0.25 || product.data.stock <= 0">
                    <Icon name="material-symbols:remove" size="16" class="sm:size-5" />
                  </button>

                  <input type="text"
                    class="w-14 sm:w-16 md:w-20 h-8 sm:h-10 md:h-12 text-center bg-transparent border-x border-gray-200 text-sm sm:text-base md:text-lg font-medium"
                    v-model="inputQuantity" @input="validateInput" @blur="validateAndUpdateQuantity"
                    @keydown="preventInvalidInput" :disabled="product.data.stock <= 0"
                    :class="{ 'text-red-500': parseFloat(inputQuantity) > product.data.stock }" />

                  <button @click="increaseQuantity"
                    class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-r-lg transition-colors"
                    :disabled="product.data.stock <= parseFloat(inputQuantity) || product.data.stock <= 0">
                    <Icon name="material-symbols:add" size="16" class="sm:size-5" />
                  </button>
                </div>
                <span class="text-sm text-gray-700">kg</span>
              </div>


              <!-- Validation message -->
              <div v-if="parseFloat(inputQuantity) > product.data.stock" class="text-red-500 text-sm animate-pulse">
                <Icon name="ph:warning" class="inline mr-1" />
                Maximum available: {{ product.data.stock }} kg
              </div>

              <!-- Total Price -->
              <div class="text-md font-medium text-gray-700">
                Total: <span class="font-bold text-gray-800">₱{{ (product.data.price *
                  parseFloat(inputQuantity)).toFixed(2) }}</span>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4 pt-4">
                <button @click="addToCart"
                  class="flex-1 h-14 rounded-xl text-white font-semibold bg-green-600 hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="product.data.stock <= 0 || parseFloat(inputQuantity) > product.data.stock">
                  <Icon name="material-symbols:shopping-cart" size="24" />
                  Add to Cart
                </button>
                <button @click="openChatModal"
                  class="w-14 h-14 rounded-xl text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center">
                  <Icon name="material-symbols:chat" size="24" />
                </button>
              </div>
            </div>

            <!-- Additional Info -->
            <div class="mt-8 pt-8 border-t border-gray-100">
              <div class="flex items-center gap-6">
                <div class="flex items-center gap-2 text-gray-600">
                  <Icon name="material-symbols:verified" size="20" class="text-green-500" />
                  <span>Quality Guaranteed</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <Icon name="material-symbols:local-shipping" size="20" class="text-green-500" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Modal -->
      <div v-if="showChatModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300"
          :class="{ 'scale-95 opacity-0': isFadingOut }">
          <div class="text-center space-y-4">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Icon name="material-symbols:chat" size="32" class="text-blue-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-800">Chat with Seller</h3>
            <p class="text-gray-600">The chat bubble can be found at the bottom left of your screen.</p>
            <button @click="closeChatModal"
              class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Got it!
            </button>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div v-if="show" class="fixed top-24 right-5 max-w-md animate-slide-in">
        <div class="bg-green-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-3">
          <Icon name="material-symbols:check-circle" size="24" />
          <span>{{ message }}</span>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from "~/layouts/AdminLayout.vue";
import { useUserStore } from "~/stores/user";
import { ref, computed, onBeforeMount, watchEffect } from "vue";

const user = useSupabaseUser();
const userStore = useUserStore();
const route = useRoute();

let product = ref(null);
let currentImage = ref(null);
let images = ref([]);
let addtocartResponse = ref(null);
let showChatModal = ref(false);
let showGuidedLine = ref(false);
let isFadingOut = ref(false);

const isLoading = ref(false);
const show = ref(false);
const message = ref("");
const inputQuantity = ref("1.00"); // Initialize with 2 decimal places

const showToast = (msg) => {
  message.value = msg;
  show.value = true;
  setTimeout(() => {
    show.value = false;
  }, 3000);
};

defineExpose({
  showToast,
});

onBeforeMount(async () => {
  product.value = await useFetch(`/api/prisma/get-product-by-id/${route.params.id}`);
});

watchEffect(() => {
  if (userStore.isAdmin()) {
    navigateTo("/admin/dashboard");
  } else if (!user.value) {
    navigateTo("/login");
  }
  if (product.value && product.value.data) {
    currentImage.value = product.value.data.url;
    images.value = [product.value.data.url];
    userStore.isLoading = false;

    // Reset quantity to 1 if stock is less than current quantity
    if (parseFloat(inputQuantity.value) > product.value.data.stock) {
      inputQuantity.value = "1.00";
    }
  }
});

const preventInvalidInput = (e) => {
  // Allow: backspace, delete, tab, escape, enter, arrows, etc.
  if ([46, 8, 9, 27, 13, 110, 190].includes(e.keyCode) ||
    (e.keyCode === 65 && e.ctrlKey === true) ||
    (e.keyCode === 67 && e.ctrlKey === true) ||
    (e.keyCode === 86 && e.ctrlKey === true) ||
    (e.keyCode === 88 && e.ctrlKey === true) ||
    (e.keyCode >= 35 && e.keyCode <= 39)) {
    return;
  }

  // Prevent if not a number or decimal point
  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
    (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 110 && e.keyCode !== 190) {
    e.preventDefault();
  }
};

const validateInput = () => {
  // Remove any non-numeric characters except decimal point
  inputQuantity.value = inputQuantity.value.replace(/[^0-9.]/g, '');

  // Ensure only one decimal point
  const parts = inputQuantity.value.split('.');
  if (parts.length > 2) {
    inputQuantity.value = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit to 2 decimal places
  if (parts.length === 2 && parts[1].length > 2) {
    inputQuantity.value = parts[0] + '.' + parts[1].substring(0, 2);
  }
};

const validateAndUpdateQuantity = () => {
  let quantity = parseFloat(inputQuantity.value) || 0.25;

  // Ensure minimum of 0.25
  if (quantity < 0.25) {
    quantity = 0.25;
  }

  // Round to nearest 0.25 increment
  quantity = Math.round(quantity * 4) / 4;

  // Ensure doesn't exceed stock
  if (product.value?.data?.stock && quantity > product.value.data.stock) {
    quantity = product.value.data.stock;
  }

  // Format display
  inputQuantity.value = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2);
};

const increaseQuantity = () => {
  let newQuantity = parseFloat(inputQuantity.value) + 0.25;

  if (product.value?.data?.stock && newQuantity > product.value.data.stock) {
    newQuantity = product.value.data.stock;
  }

  inputQuantity.value = newQuantity % 1 === 0 ? newQuantity.toString() : newQuantity.toFixed(2);
};

const decreaseQuantity = () => {
  let newQuantity = parseFloat(inputQuantity.value) - 0.25;

  if (newQuantity < 0.25) {
    newQuantity = 0.25;
  }

  inputQuantity.value = newQuantity % 1 === 0 ? newQuantity.toString() : newQuantity.toFixed(2);
};

const addToCart = async () => {
  if (!product.value || !userStore.user || parseFloat(inputQuantity.value) > product.value.data.stock) return;

  isLoading.value = true;
  userStore.isLoading = true;

  try {
    const quantity = parseFloat(inputQuantity.value);
    const productData = product.value.data;

    addtocartResponse.value = await useFetch(
      `/api/prisma/add-product-to-cart/${userStore.user.id}`,
      {
        method: "POST",
        body: {
          userId: userStore.user.id,
          productId: productData.id,
          quantity: quantity,
        },
      }
    );

    if (addtocartResponse.value.data.success === 1) {
      userStore.cartItems.push({
        productId: productData.id,
        quantity: quantity,
        productTitle: productData.title,
        productPrice: productData.price,
        productUrl: productData.url,
      });
    }
    else if (addtocartResponse.value.data.success === 2) {
      const existingProduct = userStore.cartItems.find(item => item.productId === productData.id);
      existingProduct.quantity += quantity;
    }

    userStore.refreshFlag = 1;
    showToast("Item successfully added to cart!");
  } catch (error) {
    console.error("Error adding product to cart:", error);
    showToast("Failed to add item to cart");
  } finally {
    userStore.isLoading = false;
    isLoading.value = false;
  }
};

const openChatModal = () => {
  if (window.CometChatWidget) {
    try {
      window.CometChatWidget.openOrCloseChat(true);
      window.CometChatWidget.chatWithUser("baybayaniadmin");
    } catch (error) {
      console.error("Error opening chat with admin:", error);
      showChatModal.value = true;
      showGuidedLine.value = true;
      setTimeout(() => {
        showGuidedLine.value = false;
      }, 3000);
    }
  } else {
    showChatModal.value = true;
    showGuidedLine.value = true;
    setTimeout(() => {
      showGuidedLine.value = false;
    }, 3000);
  }
};

const closeChatModal = () => {
  isFadingOut.value = true;
  setTimeout(() => {
    showChatModal.value = false;
    isFadingOut.value = false;
  }, 500);
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.scale-95 {
  transform: scale(0.95);
}

.opacity-0 {
  opacity: 0;
}

/* Disable number input spinners */
input[type="text"] {
  -moz-appearance: textfield;
}

input[type="text"]::-webkit-outer-spin-button,
input[type="text"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>