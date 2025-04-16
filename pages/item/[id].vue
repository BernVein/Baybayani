  <template>
    <AdminLayout>
      <Loading v-if="isLoading" />
      <div id="ItemPage" class="mt-0 max-w-[1200px] mx-auto px-4">
        <!-- Breadcrumb -->
        <nav class="mb-6 flex items-center text-sm text-gray-500">
          <NuxtLink to="/" class="hover:text-green-600 transition-colors">Home</NuxtLink>
          <span class="mx-2">›</span>
          <span class="text-gray-800">{{ product?.data?.title || 'Product Details' }}</span>
        </nav>

        <div class="flex flex-col lg:flex-row gap-10 justify-between mx-auto w-full">
          <!-- Left Section: Images -->
          <div class="w-full lg:w-[45%]">
            <div class="sticky top-24">
              <div class="relative group">
                <img v-if="currentImage"
                  class="rounded-2xl object-cover w-full h-[500px] transition-all duration-500 ease-in-out shadow-lg group-hover:shadow-2xl"
                  :src="currentImage" :alt="product?.data?.title" />
                
                <!-- Zoom overlay -->
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 rounded-2xl"></div>
                
                <!-- Stock badge -->
                <div v-if="product?.data?.stock <= 0"
                  class="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                  Out of Stock
                </div>
              </div>
              
              <div class="flex mt-6 gap-4 justify-center">
                <img v-for="(image, index) in images" :key="index" :src="image"
                  class="h-24 w-24 object-cover rounded-lg border-2 cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
                  :class="currentImage === image ? 'border-green-500 shadow-lg' : 'border-transparent'"
                  @click="currentImage = image" :alt="`${product?.data?.title} thumbnail ${index + 1}`" />
              </div>
            </div>
          </div>

          <!-- Right Section: Product Details -->
          <div class="w-full lg:w-[55%]">
            <div v-if="product && product.data" class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <!-- Title and Price -->
              <div class="space-y-4">
                <h1 class="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                  {{ product.data.title }}
                </h1>
                <div class="flex items-center justify-between">
                  <div class="text-2xl lg:text-3xl font-bold text-green-600">
                    ₱{{ product.data.price }} <span class="text-lg text-gray-500 font-normal">per kg</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="h-3 w-3 rounded-full" 
                      :class="product.data.stock > 0 ? 'bg-green-500' : 'bg-red-500'"></div>
                    <span :class="product.data.stock > 0 ? 'text-green-600' : 'text-red-500'" class="font-medium">
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
              <div class="mt-8 space-y-6">
                <div class="flex items-center gap-4">
                  <label class="font-medium text-gray-700">Quantity:</label>
                  <div class="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                    <button @click="decreaseQuantity"
                      class="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-l-lg transition-colors"
                      :disabled="parseFloat(inputQuantity) <= 1">
                      <Icon name="material-symbols:remove" size="20" />
                    </button>
                    <input type="text"
                      class="w-20 h-12 text-center bg-transparent border-x border-gray-200 text-lg font-medium"
                      v-model="inputQuantity" @input="validateInput" @blur="validateAndUpdateQuantity" />
                    <button @click="increaseQuantity"
                      class="w-12 h-12 flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-r-lg transition-colors"
                      :disabled="product.data.stock <= parseFloat(inputQuantity)">
                      <Icon name="material-symbols:add" size="20" />
                    </button>
                  </div>
                  <span class="text-sm text-gray-500">kg</span>
                </div>

                <!-- Total Price -->
                <div class="text-lg text-gray-600">
                  Total: <span class="font-bold text-gray-800">₱{{ (product.data.price * parseFloat(inputQuantity)).toFixed(2) }}</span>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-4 pt-4">
                  <button @click="addToCart"
                    class="flex-1 h-14 rounded-xl text-white font-semibold bg-green-600 hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="product.data.stock <= 0">
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
        <div v-if="show" 
          class="fixed top-24 right-5 max-w-md animate-slide-in">
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
const role = userStore.profile?.role;

const isLoading = ref(false); // Loading state

const show = ref(false);
const message = ref("");

const showToast = (msg) => {
  message.value = msg;
  show.value = true;
  setTimeout(() => {
    show.value = false;
  }, 3000); // Hide after 3 seconds
};

defineExpose({
  showToast,
});

let inputQuantity = ref(1.0); // Initialize with 1 as the default


onBeforeMount(async () => {
  product.value = await useFetch(`/api/prisma/get-product-by-id/${route.params.id}`);
});

watchEffect(() => {

  if (!user.value || role === "Admin") {
    navigateTo("/admin/dashboard");
  }
  if (product.value && product.value.data) {
    currentImage.value = product.value.data.url;
    images.value = [product.value.data.url];
    userStore.isLoading = false;
  }
});


const validateInput = () => {
  // Regular expression to allow only digits and one decimal point.
  const regex = /^[0-9]*\.?[0-9]*$/;

  // If the input doesn't match the regex, reset it to the previous value
  if (!regex.test(inputQuantity.value)) {
    inputQuantity.value = inputQuantity.value.slice(0, -1); // Remove last character
  }
};


const validateAndUpdateQuantity = async () => {
  // Parse the value as a float to allow decimals
  let quantity = parseFloat(inputQuantity.value);

  // If the input is invalid or below 1, set it to 1
  if (isNaN(quantity) || quantity < 1) {
    inputQuantity.value = '1';
  } else if (quantity > 100) {
    inputQuantity.value = '100'; // Optional: enforce a max quantity
  } else {
    // Round the quantity to the nearest 0.25 increment
    quantity = Math.round(quantity * 4) / 4; // This rounds to the nearest 0.25

    // If the quantity is a whole number, don't display decimals
    if (Number.isInteger(quantity)) {
      inputQuantity.value = quantity.toString(); // Remove decimals
    } else {
      inputQuantity.value = quantity.toFixed(2); // Keep 2 decimal places
    }
  }

  // Update quantity in the store after validation
  updateQuantity();
};



const increaseQuantity = () => {
  inputQuantity.value = (parseFloat(inputQuantity.value) + 0.25).toFixed(2);
};

// Function to decrease quantity
const decreaseQuantity = () => {
  if (parseFloat(inputQuantity.value) > 1) {
    inputQuantity.value = (parseFloat(inputQuantity.value) - 0.25).toFixed(2);
  }
};

const addToCart = async () => {
  isLoading.value = true;

  if (!product.value || !userStore.user) return;

  const productData = product.value.data;
  const userId = userStore.user.id;

  userStore.isLoading = true;


  try {
    const quantity = parseFloat(inputQuantity.value);
    addtocartResponse.value = await useFetch(
      `/api/prisma/add-product-to-cart/${userId}`,
      {
        method: "POST",
        body: {
          userId,
          productId: productData.id,
          quantity: quantity,
        },
      }
    );

    if (addtocartResponse.value.data.success === 1) {
      userStore.cartItems.push({
        productId: productData.id,
        quantity: inputQuantity.value,
        productTitle: productData.title,
        productPrice: productData.price,
        productUrl: productData.url,
      });
    }
    else if (addtocartResponse.value.data.success === 2) {
      const existingProduct = userStore.cartItems.find(item => item.productId === productData.id);
      existingProduct.quantity += inputQuantity.value;
    }


    userStore.refreshFlag = 1;
    showToast("Item successfully added to cart!");
    //await userStore.fetchCartItems();
  } catch (error) {
    console.error("Error adding product to cart:", error);
  } finally {
    userStore.isLoading = false;
    isLoading.value = false;
  }
};

const openChatModal = () => {
  // Directly open the CometChat widget and start chat with Baybayani Admin
  if (window.CometChatWidget) {
    try {
      // First make sure the widget is open
      window.CometChatWidget.openOrCloseChat(true);

      // Then start a chat with the specific user "Baybayani Admin"
      // Note: the parameter should be the UID of the admin user in CometChat
      window.CometChatWidget.chatWithUser("baybayaniadmin");
    } catch (error) {
      console.error("Error opening chat with admin:", error);

      // Fallback to showing the modal if widget can't be opened
      showChatModal.value = true;
      showGuidedLine.value = true;
      setTimeout(() => {
        showGuidedLine.value = false;
      }, 3000);
    }
  } else {
    // Fallback to showing the modal if widget isn't available
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
  }, 500); // Match this duration with the fade-out animation duration
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

/* Smooth transitions */
.scale-95 {
  transform: scale(0.95);
}

.opacity-0 {
  opacity: 0;
}
</style>
