  <template>
    <AdminLayout>
      <Loading v-if="isLoading" />
      <div id="ItemPage" class="mt-4 max-w-[1200px] mx-auto px-2">

        <div class="flex flex-col lg:flex-row gap-10 justify-between mx-auto w-full">
          <!-- Left Section: Images -->
          <div class="w-full lg:w-[40%]">
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
          <div
            class="w-full lg:w-[50%] bg-white p-6 rounded-lg shadow-md transition-all duration-500 ease-in-out hover:shadow-lg">
            <div v-if="product && product.data">
              <div class="flex items-center justify-between">
                <h1
                  class="text-2xl lg:text-4xl font-semibold text-gray-800 transition-colors duration-300 ease-in-out hover:text-green-600">
                  {{ product.data.title }}
                </h1>
                <div
                  class="text-lg lg:text-3xl font-bold p-2 text-red-500 transition-colors duration-300 ease-in-out hover:text-red-600">
                  ₱{{ product.data.price }} / kg
                </div>
              </div>
              <p class="mt-6 text-lg lg:text-lg font-light text-gray-600">Product Details:</p>
              <p
                class="mt-2 text-md lg:text-md text-gray-700 mb-4 transition-colors duration-300 ease-in-out hover:text-gray-900">
                {{ product.data.description }}
              </p>

              <!-- QUANTITY BOX -->

              <div class="flex items-center justify-start mt-10">
                <div class="flex items-center justify-start mr-2 font-semibold text-gray-700">
                  Quantity:
                </div>
                <!-- Decrease Button -->
                <button @click="decreaseQuantity"
                  class="w-[29px] h-[35px] lg:w-[34px] lg:h-[40px] bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-l-md flex items-center justify-center font-semibold text-gray-700 text-lg">
                  -
                </button>

                <!-- Quantity Input -->
                <input type="text"
                  class="w-[50px] h-[35px] lg:w-[55px] lg:h-[40px] text-md lg:text-lg text-center border-t border-b border-gray-300 mx-0"
                  v-model="inputQuantity" @input="validateInput" @blur="validateAndUpdateQuantity" />

                <!-- Increase Button -->
                <button @click="increaseQuantity"
                  class="w-[29px] h-[35px] lg:w-[34px] lg:h-[40px] bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-r-md flex items-center justify-center font-semibold text-gray-700 text-lg">
                  +
                </button>
              </div>


              <div class="flex gap-8 mt-8">
                <button @click="addToCart"
                  class="px-11 lg:px-8 py-3 rounded-lg text-white text-sm lg:text-lg font-semibold bg-green-600 hover:bg-green-700 transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">

                  <!-- Text when item is not in cart -->
                  <span class="transition-opacity duration-300 ease-in-out">Add to Cart</span>

                  <!-- Icon when item is not in cart -->
                  <Icon name="mynaui:cart-plus" size="30"
                    class="ml-2 transition-all duration-300 ease-in-out transform scale-110" />
                </button>

                <button @click="openChatModal"
                  class="px-8 py-3 rounded-lg text-blue-600 border border-blue-600 text-sm lg:text-lg font-semibold hover:bg-blue-50 transition-transform duration-300 ease-in-out hover:scale-105 flex items-center hidden md:block">
                  <span class="mr-2">Chat Seller</span>
                  <Icon name="mynaui:message" size="25" />
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- Modal Pop-up -->
        <div v-if="showChatModal" :class="['modal-overlay', { 'fade-out': isFadingOut }]">
          <div class="modal-content" :class="{ 'fade-out': isFadingOut }">
            <p>The chat bubble can be seen at the bottom left of the screen.</p>
            <button @click="closeChatModal" class="close-modal-button">Got it!</button>
          </div>
        </div>

        <!-- Rectangle Animation -->
        <div v-if="showGuidedLine" class="rectangle-animation"></div>
      </div>
      <div v-if="show" class="toast-notification fixed top-24 right-5 bg-green-600 text-white p-4 rounded-lg shadow-lg"
        :style="{ animation: 'fadeInOut 3s forwards' }">
        {{ message }}
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
  showChatModal.value = true;
  showGuidedLine.value = true; // Start the animation when the chat modal is opened
  setTimeout(() => {
    showGuidedLine.value = false;
  }, 3000); // Show the rectangle for 3 seconds
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
@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateX(10px);
  }

  50% {
    opacity: 1;
    transform: translateX(0);
  }

  100% {
    opacity: 0;
    transform: translateX(10px);
  }
}

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
  animation: fadeIn 0.5s forwards;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  color: #333;
  max-width: 300px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s forwards;
}

.fade-out {
  animation: fadeOut 0.5s forwards;
}

.close-modal-button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #03A9F4;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.close-modal-button:hover {
  background-color: #0288D1;
}

.rectangle-animation {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 0;
  height: 0;
  border: 2px solid #03A9F4;
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
    width: 100px;
    height: 0;
    opacity: 1;
  }

  75% {
    width: 100px;
    height: 75px;
    opacity: 1;
  }

  100% {
    width: 0px;
    height: 75px;
    opacity: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

/* Add responsive styles if needed */
@media (max-width: 768px) {
  #ItemPage {
    flex-direction: column;
    /* Stack elements vertically on mobile */
  }
}
</style>
