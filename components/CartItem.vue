<template>
  <div class="flex justify-start my-2">
    <!-- Check Button -->
    <div class="my-auto">
      <div @mouseenter="isHover = true" @mouseleave="isHover = false"
        class="flex items-center justify-start p-0.5 cursor-pointer"
        :class="{ 'cursor-not-allowed': product.stock <= 0 }">

        <!-- Checkbox to select/deselect product -->
        <div @click="!product.stock <= 0 && toggleSelection()"
          class="flex items-center border-[#0C6539] justify-center h-[20px] w-[20px] rounded border mr-3" :class="{
            'border-[#0C6539] border-2': isSelected,
            'border-gray-300 opacity-50': product.stock <= 0
          }">

          <input type="checkbox" class="hidden" v-model="isSelected" :disabled="product.stock <= 0" />

          <!-- Show checkmark when selected -->
          <div v-if="isSelected" class="h-[16px] w-[16px] flex items-center justify-center">
            <Icon name="mingcute:check-fill" size="80" class="text-[#0C6539]" />
          </div>
        </div>
      </div>
    </div>

    <!-- Product Image -->
    <img class="rounded-md w-[140px] h-[138px] md:w-[150px] " :src="product.url" loading="lazy"
      :class="{ 'opacity-50': product.stock <= 0 }" />

    <div class="overflow-hidden pl-2 w-full">
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center justify-between truncate">
          <span
            class="sm:block hidden bg-[#0C6539] text-white text-[11px] font-semibold px-1.5 rounded-sm min-w-[60px] text-center">Vegetables</span>
          <div class="truncate sm:pl-2" :class="{ 'opacity-50': product.stock <= 0 }">{{ product.title }}</div>
        </div>

        <!-- Remove From Cart -->
        <button @click="deleteFromCart()" class="mx-3 sm:block hidden -mt-0.5 hover:text-red-500">
          <Icon name="material-symbols:delete-outline" size="20" />
        </button>
      </div>

      <!-- Other Text Elements -->
      <div class="text-xl font-semibold text-[#FD374F]" :class="{ 'opacity-50': product.stock <= 0 }">
        ₱<span class="font-bold text-[#FD374F]">{{ product.price }}</span>
      </div>

      <!-- Stock Information -->
      <div class="text-sm" :class="product.stock <= 0 ? 'text-red-500' : 'text-gray-500'">
        {{ product.stock <= 0 ? 'Out of stock' : `Available: ${product.stock} kg` }} </div>

          <div class="flex items-center justify-end">
            <button @click="deleteFromCart()" class="sm:hidden block -mt-0.5 hover:text-red-500">
              <Icon name="material-symbols:delete-outline" size="20" />
            </button>
          </div>

          <!-- Quantity Selector -->
          <div class="flex items-center justify-start mt-2" v-if="product.stock > 0">
            <!-- Decrease Button -->
            <button @click="decreaseQuantity"
              class="w-[34px] h-[34px] bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-l-md flex items-center justify-center"
              :disabled="product.quantity <= 0.25">
              -
            </button>

            <!-- Quantity Input -->
            <input type="text" class="w-[45px] h-[34px] text-center border-t border-b border-gray-300 mx-0"
              v-model="quantityDisplay" @blur="validateAndUpdateQuantity" @input="validateInput"
              @keydown="preventInvalidInput"
              :class="{ 'border-red-500': parseFloat(product.quantity) > product.stock }" />

            <!-- Increase Button -->
            <button @click="increaseQuantity"
              class="w-[34px] h-[34px] bg-gray-200 hover:bg-gray-300 border border-gray-300 rounded-r-md flex items-center justify-center"
              :disabled="product.quantity >= product.stock">
              +
            </button>
          </div>

          <!-- Validation messages -->
          <div v-if="product.stock <= 0" class="text-red-500 text-sm mt-1">
            This product is currently out of stock
          </div>
          <div v-else-if="parseFloat(product.quantity) > product.stock" class="text-red-500 text-xs mt-1 animate-pulse">
            <Icon name="ph:warning" class="inline mr-1" />
            Maximum available: {{ product.stock }} kg
          </div>
      </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch, toRefs } from "vue";
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const props = defineProps(["product", "selectedArray"]);
const { product, selectedArray } = toRefs(props);
const emit = defineEmits(["selectedRadio"]);

let isHover = ref(false);
let isSelected = ref(false);
let quantityDisplay = ref('');

onMounted(() => {
  const cartIndex = userStore.cartItems.findIndex(
    (item) => item.productId === product.value.id
  );

  if (cartIndex !== -1) {
    isSelected.value = userStore.cartItems[cartIndex].checked;
    product.value.quantity = userStore.cartItems[cartIndex].quantity;
    quantityDisplay.value = product.value.quantity.toString();

    if (product.value.stock <= 0 && isSelected.value) {
      uncheckProduct();
    }
  } else {
    quantityDisplay.value = product.value.quantity.toString();
  }
});

watch(() => product.value.quantity, (newVal) => {
  quantityDisplay.value = newVal.toString();
});

watch(() => product.value.stock, (newStock) => {
  if (newStock <= 0 && isSelected.value) {
    uncheckProduct();
  } else if (parseFloat(product.value.quantity) > newStock) {
    product.value.quantity = newStock;
    updateQuantity();
  }
});

const uncheckProduct = async () => {
  isSelected.value = false;
  await saveSelectionToDatabase();
  emitSelectionUpdate();
};

const toggleSelection = async () => {
  if (product.value.stock <= 0) {
    if (isSelected.value) await uncheckProduct();
    return;
  }

  isSelected.value = !isSelected.value;
  await saveSelectionToDatabase();
  emitSelectionUpdate();
};

const deleteFromCart = async () => {
  const userId = userStore.user.id;
  const productId = props.product.id;

  userStore.cartItems = userStore.cartItems.filter(
    (item) => item.productId !== productId
  );

  if (isSelected.value) {
    emit("selectedRadio", {
      id: product.value.id,
      quantity: product.value.quantity,
      val: false,
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
      await userStore.fetchCartItems();
    }
  } catch (error) {
    console.error("Error deleting product from cart:", error);
  }
};

const emitSelectionUpdate = () => {
  emit("selectedRadio", {
    id: product.value.id,
    quantity: product.value.quantity,
    price: product.value.price,
    val: isSelected.value,
  });
};

watch(() => isSelected.value, (val) => {
  emitSelectionUpdate();
});

const updateQuantity = () => {
  const cartIndex = userStore.cartItems.findIndex(
    (item) => item.productId === product.value.id
  );

  if (cartIndex !== -1) {
    userStore.cartItems[cartIndex].quantity = product.value.quantity;
    emitSelectionUpdate();
  }
};

const preventInvalidInput = (e) => {
  if ([46, 8, 9, 27, 13, 110, 190].includes(e.keyCode) ||
    (e.keyCode === 65 && e.ctrlKey === true) ||
    (e.keyCode === 67 && e.ctrlKey === true) ||
    (e.keyCode === 86 && e.ctrlKey === true) ||
    (e.keyCode === 88 && e.ctrlKey === true) ||
    (e.keyCode >= 35 && e.keyCode <= 39)) {
    return;
  }

  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
    (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 110 && e.keyCode !== 190) {
    e.preventDefault();
  }
};

const validateInput = () => {
  quantityDisplay.value = quantityDisplay.value.replace(/[^0-9.]/g, '');

  const parts = quantityDisplay.value.split('.');
  if (parts.length > 2) {
    quantityDisplay.value = parts[0] + '.' + parts.slice(1).join('');
  }

  if (parts.length === 2 && parts[1].length > 2) {
    quantityDisplay.value = parts[0] + '.' + parts[1].substring(0, 2);
  }
};

const validateAndUpdateQuantity = async () => {
  let quantity = parseFloat(quantityDisplay.value) || 0.25;

  if (quantity < 0.25) {
    quantity = 0.25;
  }

  quantity = Math.round(quantity * 4) / 4;

  if (quantity > product.value.stock) {
    quantity = product.value.stock;
  }

  quantityDisplay.value = quantity.toFixed(2);
  product.value.quantity = quantity;

  await updateQuantityInDatabase();
  updateQuantity();
};

const increaseQuantity = async () => {
  let newQuantity = parseFloat(product.value.quantity) + 0.25;

  if (newQuantity > product.value.stock) {
    newQuantity = product.value.stock;
  }

  product.value.quantity = newQuantity;
  quantityDisplay.value = newQuantity.toFixed(2);
  await updateQuantityInDatabase();
  updateQuantity();
};

const decreaseQuantity = async () => {
  let newQuantity = parseFloat(product.value.quantity) - 0.25;

  if (newQuantity < 0.25) {
    newQuantity = 0.25;
  }

  product.value.quantity = newQuantity;
  quantityDisplay.value = newQuantity.toFixed(2);
  await updateQuantityInDatabase();
  updateQuantity();
};

const updateQuantityInDatabase = async () => {
  try {
    const quantity = parseFloat(product.value.quantity);
    const response = await $fetch('/api/prisma/update-quantity', {
      method: 'POST',
      body: {
        cartId: userStore.cart.id,
        productId: product.value.id,
        quantity: quantity,
      },
    });

    if (!response.success) {
      console.error("Error updating quantity:", response.error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const saveSelectionToDatabase = async () => {
  try {
    const response = await $fetch('/api/prisma/update-selection', {
      method: 'POST',
      body: {
        cartId: userStore.cart.id,
        productId: product.value.id,
        isSelected: isSelected.value,
      },
    });

    if (!response.success) {
      console.error('Error updating selection:', response.error);
    }
  } catch (error) {
    console.error('Error saving selection to database:', error);
  }
};
</script>

<style scoped>
input[type="text"] {
  -moz-appearance: textfield;
}

input[type="text"]::-webkit-outer-spin-button,
input[type="text"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>