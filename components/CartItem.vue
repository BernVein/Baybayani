<!--/components/CartItem.vue -->
<template>
  <div class="flex justify-start my-2">
    <!-- Check Button -->
    <div class="my-auto">
      <!-- <div @mouseenter="isHover = true" @mouseleave="isHover = false"
        class="flex items-center justify-start p-0.5 cursor-pointer">
        <div @click="toggleSelection"
          class="flex items-center justify-center h-[20px] w-[20px] rounded-full border mr-5 ml-2" :class="[
            isHover ? 'border-[#0C6539]' : 'border-gray-300',
            isSelected ? 'bg-[#0C6539]' : '',
          ]">
          <div class="h-[8px] w-[8px] rounded-full bg-white" />
        </div>
      </div> -->

      <div @mouseenter="isHover = true" @mouseleave="isHover = false"
        class="flex items-center justify-start p-0.5 cursor-pointer">

        <!-- Checkbox to select/deselect product -->
        <div @click="toggleSelection"
          class="flex items-center justify-center h-[20px] w-[20px] rounded border mr-5 ml-2" :class="{
            'border-[#0C6539]': isSelected,                   // Border when selected (Green)
            'border-[#0C6539]': isHover && !isSelected,       // Border when hovered and not selected
            'border-gray-300': !isSelected && !isHover        // Default border when not selected and not hovered
          }">

          <input type="checkbox" class="hidden" v-model="isSelected" />

          <!-- Show checkmark when selected -->
          <div v-if="isSelected" class="h-[16px] w-[16px] flex items-center justify-center">
            <Icon name="mingcute:check-fill" size="80" class="text-[#0C6539]" />
          </div>
          <!-- Show empty circle when not selected -->
        </div>
      </div>


    </div>

    <!-- Product Image -->
    <img class="rounded-md md:w-[150px] w-[90px]" :src="product.url" />

    <div class="overflow-hidden pl-2 w-full">
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center justify-between truncate">
          <span
            class="sm:block hidden bg-[#0C6539] text-white text-[11px] font-semibold px-1.5 rounded-sm min-w-[60px] text-center">Vegetables</span>
          <div class="truncate sm:pl-2">{{ product.title }}</div>
        </div>

        <!-- Remove From Cart -->

        <button @click="deleteFromCart()" class="mx-3 sm:block hidden -mt-0.5 hover:text-red-500">
          <Icon name="material-symbols:delete-outline" size="20" />
        </button>
      </div>

      <!-- Other Text Elements -->

      <div class="text-xl font-semibold text-[#FD374F]">
        ₱
        <span class="font-bold text-[#FD374F]">{{ product.price }}</span>
      </div>

      <div class="flex items-center justify-end">
        <button @click="deleteFromCart()" class="sm:hidden block -mt-0.5 hover:text-red-500">
          <Icon name="material-symbols:delete-outline" size="20" />
        </button>
      </div>
      <!-- Quantity Selector -->
      <div class="flex items-center justify-start mt-3">
        <!-- Decrease Button -->
        <button @click="decreaseQuantity"
          class="w-[34px] h-[34px] bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-l-md flex items-center justify-center">
          -
        </button>

        <!-- Quantity Input -->
        <input type="text" class="w-[45px] h-[34px] text-center border-t border-b border-gray-300 mx-0"
          v-model="product.quantity" @blur="validateAndUpdateQuantity" @input="validateInput" />

        <!-- Increase Button -->
        <button @click="increaseQuantity"
          class="w-[34px] h-[34px] bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-r-md flex items-center justify-center">
          +
        </button>
      </div>



    </div>
  </div>
</template>

<script setup>
import { onBeforeMount } from "vue";
import { useUserStore } from "~/stores/user"; // Import the user store to interact with the global state (e.g., cart)
const userStore = useUserStore(); // Initialize the user store, allowing access to the cart and other user-related data

const props = defineProps(["product", "selectedArray"]); // Define props for `product` and `selectedArray` that will be passed from the parent
const { product, selectedArray } = toRefs(props); // Create reactive references for `product` and `selectedArray` for use in the component

const emit = defineEmits(["selectedRadio"]); // Define the event `selectedRadio` that this component can emit to its parent

let isHover = ref(false);
let isSelected = ref(false);

onMounted(() => {
  const cartIndex = userStore.cartItems.findIndex(
    (item) => item.productId === product.value.id
  );

  if (cartIndex !== -1) {
    product.value.quantity = userStore.cartItems[cartIndex].quantity;
  }

  updateQuantity();
});


const deleteFromCart = async () => {
  const userId = userStore.user.id; // Assuming userStore holds user data
  const productId = props.product.id; // Assuming props.product holds the product to delete

  //console.log("Deleting product:", productId);

  userStore.cartItems = userStore.cartItems.filter(
    (item) => item.productId !== productId
  );

  if (isSelected.value) {
    // This will also notify the parent component to remove this product from `selectedArray`
    emit("selectedRadio", {
      id: product.value.id,
      quantity: product.value.quantity, // Send the quantity as well
      val: false, // Unselect the product
    });
  }

  try {
    const response = await fetch(
      `/api/prisma/remove-product-to-cart/${userId}/${productId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (data.success === 1) {
      //  console.log("Product successfully removed from cart!");
      await userStore.fetchCartItems();
      // Optionally update the store or UI here
    } else {
      //console.log("Error:", data.message);
    }
  } catch (error) {
    console.error("Error deleting product from cart:", error);
  }
};

const toggleSelection = () => {
  //  console.log("Toggle Clicked!");
  isSelected.value = !isSelected.value;
  emitSelectionUpdate();
};

const emitSelectionUpdate = () => {
  emit("selectedRadio", {
    id: product.value.id,
    quantity: product.value.quantity, // Send the quantity as well
    price: product.value.price,
    val: isSelected.value,
  });
};

watch(
  () => isSelected.value,
  (val) => {
    emitSelectionUpdate(); // Emit the updated selection state
  }
);

const updateQuantity = () => {
  // Find the product index in the cartItems array
  const cartIndex = userStore.cartItems.findIndex(
    (item) => item.productId === product.value.id
  );

  if (cartIndex !== -1) {
    // Update the quantity in the store
    userStore.cartItems[cartIndex].quantity = product.value.quantity;
    //console.log("current quantity", userStore.cartItems[cartIndex].quantity);
    emitSelectionUpdate();
  } else {
    //console.log("Product not found in cart");
  }
};

// Function to increase quantity
const increaseQuantity = () => {
  product.value.quantity++; // Increment quantity
  // console.log("QUAnityt type", typeof product.value.quantity);
  updateQuantity(); // Update the quantity in the store
};

// Function to decrease quantity
const decreaseQuantity = () => {
  if (props.product.quantity > 1) {
    // Prevent decreasing quantity below 1
    product.value.quantity--; // Decrement quantity
    updateQuantity(); // Update the quantity in the store
  }
};

const validateInput = () => {
  // Only sanitize non-numeric characters but allow partial input
  product.value.quantity = product.value.quantity.replace(/\D/g, '');
};

const validateAndUpdateQuantity = () => {
  // Ensure the quantity is a valid number and within the expected range when the input loses focus
  let quantity = parseInt(product.value.quantity);

  // console.log("CLLLLLLLLLLLLLLED");

  //console.log("quanitty", quantity);
  //console.log("Data type of quantity:", typeof quantity);


  // If invalid, default to 1
  if (isNaN(quantity) || quantity < 1) {
    product.value.quantity = '1'; // Default to 1 if invalid or less than 1
  } else if (quantity > 100) {
    product.value.quantity = '100'; // Optional: enforce a max quantity of 100
  } else {
    product.value.quantity = quantity;
  }

  // Update quantity in the store after validation
  updateQuantity();
};
</script>
