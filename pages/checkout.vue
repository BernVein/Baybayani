<template>
  <AdminLayout>
    <div id="CheckoutPage" class="mt-4 max-w-[1200px] mx-auto px-2">
      <div class="md:flex gap-4 justify-between mx-auto w-full">
        <!-- Pickup Information -->
        <div class="md:w-[65%]">
          <div class="bg-[#F8F9FA] rounded-lg p-4">
            <div class="text-xl font-semibold mb-2 text-[#0C6539]">
              Pickup Information
            </div>
            <div class="pt-2 border-t border-[#E0E0E0]">
              <ul class="text-sm">
                <li class="flex items-center gap-2">
                  <div>Address:</div>
                  <div class="font-bold text-[#0C6539]">
                    Baybay City Public Market
                  </div>
                </li>
                <li class="flex items-center gap-2">
                  <div>Landmark:</div>
                  <div class="font-bold text-[#0C6539]">Beside Bagsakan</div>
                </li>
                <li class="flex items-center gap-2">
                  <div>Map location:</div>
                  <div class="font-bold text-[#0C6539]">Google Maps Link</div>
                </li>
                <li class="flex items-center gap-2">
                  <div>Contact:</div>
                  <div class="font-bold text-[#0C6539]">09123456789</div>
                </li>
              </ul>
            </div>
          </div>
          <div id="Items" class="bg-white rounded-lg p-4 mt-4">
            <div
              v-for="(cartItem, index) in userStore.checkout"
              :key="cartItem.id"
            >
              <!-- Use the index to find the specific cartItem in the checkout array -->
              <CheckoutItem :product="userStore.checkout[index].product" />
            </div>
          </div>
        </div>

        <!-- Place Order -->
        <div class="md:hidden block my-4" />
        <div class="md:w-[35%]">
          <div id="PlaceOrder" class="bg-[#F8F9FA] rounded-lg p-4">
            <div class="text-2xl font-extrabold mb-2 text-[#0C6539]">
              Summary
            </div>

            <div class="border-t my-5 border-[#E0E0E0]" />

            <div class="flex items-center justify-between my-4">
              <div class="font-semibold">Total</div>
              <div class="text-2xl font-semibold text-[#FF3200]">
                ₱
                <span class="font-extrabold text-[#FF3200]">{{ total }}</span>
              </div>
            </div>

            <button
              @click="placeOrder"
              class="mt-4 bg-gradient-to-r from-[#0C6539] to-[#0C6539] w-full text-white text-[21px] font-semibold p-1.5 rounded-full"
            >
              Confirm Order
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from "~/layouts/AdminLayout.vue";
import { useUserStore } from "~/stores/user";
const userStore = useUserStore();
const user = useSupabaseUser();
const route = useRoute();

//definePageMeta({ middleware: "auth" });

let total = ref(0);

await userStore.isAdmin();
watchEffect(() => {
  if (route.fullPath == "/checkout" && !user.value) {
    navigateTo("/login");
  } else if (route.fullPath == "/checkout" && userStore.checkout.length === 0) {
    navigateTo("/shoppingcart");
  }
});

onMounted(() => {
  userStore.checkout.forEach((item) => {
    console.log(item); // Print the item to inspect its properties
    total.value += item.product.price * item.quantity;
  });
});

const placeOrder = async () => {
  try {
    console.log("Placing the order...");

    // Log user and checkout items before creating the order
    console.log("User ID:", user.value.id); // Log user ID
    console.log("Checkout items:", userStore.checkout); // Log the checkout items

    // Call createOrder to send the order to the backend
    await createOrder();

    // Clear the checkout items after placing the order
    //userStore.cart = []; // Clear the cart (optional, if you want to empty the cart after order)
    userStore.checkout = []; // Clear the checkout items
    console.log("Checkout items cleared.");

    // Redirect to the success page after a short delay
    setTimeout(() => {
      console.log("Redirecting to the success page...");
      navigateTo("/success"); // Redirect to the success page
    }, 500);
  } catch (error) {
    console.error("Error placing the order:", error); // Log any error that occurs
  }
};

const createOrder = async () => {
  try {
    console.log("Creating order with the following data:");

    const checkoutData = userStore.checkout.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    // Log the order data before sending it to the backend
    console.log("Order data:", {
      userId: user.value.id,
      checkoutItem: checkoutData,
    });

    // Send the request to the backend to create the order
    const response = await useFetch("/api/prisma/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Ensure correct header
      },
      body: JSON.stringify({
        userId: user.value.id,
        checkoutItem: checkoutData,
      }),
    });

    // Log the response from the API
    console.log("Order response:", response);
  } catch (error) {
    console.error("Error creating the order:", error);
  }
};
</script>
