<template>
  <AdminLayout>
    <div id="CheckoutPage" class="mt-4 max-w-[1200px] mx-auto px-2">
      <div class="md:flex gap-4 justify-between mx-auto w-full">
        <!-- Pickup Information -->
        <div class="md:w-[65%]">
          <div class="bg-white rounded-lg p-4">
            <div class="text-xl font-semibold mb-2">Pickup Information</div>
            <div class="pt-2 border-t">
              <ul class="text-sm">
                <li class="flex items-center gap-2">
                  <div>Address:</div>
                  <div class="font-semibold">Baybay City Public Market</div>
                </li>
                <li class="flex items-center gap-2">
                  <div>Landmark:</div>
                  <div class="font-semibold">Beside Bagsakan</div>
                </li>

                <li class="flex items-center gap-2">
                  <div>Contact:</div>
                  <div class="font-semibold">09123456789</div>
                </li>
              </ul>
            </div>
          </div>
          <div id="Items" class="bg-white rounded-lg p-4 mt-4">
            <div v-for="(cartItem, index) in userStore.checkout" :key="cartItem.id">
              <!-- Use the index to find the specific cartItem in the checkout array -->
              <CheckoutItem :product="userStore.checkout[index]" />
            </div>
          </div>
        </div>

        <!-- Place Order -->
        <div class="md:hidden block my-4" />
        <div class="md:w-[35%]">
          <div id="PlaceOrder" class="bg-white rounded-lg p-4">
            <div class="text-2xl font-extrabold mb-2">Summary</div>

            <div class="border-t my-5" />

            <div class="flex items-center justify-between my-4">
              <div class="font-semibold">Total</div>
              <div class="text-2xl font-semi bold text-[#FD374F]">
                ₱
                <span class="font-extrabold text-[#FD374F]">{{ total }}</span>
              </div>
            </div>

            <button @click="placeOrder"
              class="mt-4 bg-gradient-to-r from-[#FF3200] to-[#FF3200] w-full text-white text-[21px] font-semibold p-1.5 rounded-full">
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


//definePageMeta({ middleware: "auth" });

let total = ref(0);


const route = useRoute();
const role = userStore.profile?.role;
watchEffect(() => {
  if (route.fullPath == "/checkout" &&
    (!user.value || role === "Admin")) {
    //navigateTo("/admin/dashboard");
    window.location.href = "/admin/dashboard";
  }


  else if (route.fullPath == "/checkout" && !user.value) {
    //navigateTo("/login");
    window.location.href = "/login";

  }
  // else if (route.fullPath == "/checkout" && userStore.checkout.length === 0) {
  //   //navigateTo("/shoppingcart");
  //   window.location.href = "/shoppingcart";

  // }
});



onMounted(() => {
  if (route.fullPath == "/checkout" && !user.value) {
    //navigateTo("/login");
    window.location.href = "/login";
  }
  // else if (route.fullPath == "/checkout" && userStore.checkout.length === 0) {
  //   //navigateTo("/shoppingcart");
  //   window.location.href = "/shoppingcart";
  // }

  userStore.cartItems.forEach((item) => {
    if (item.checked === true) {
      // Push checked items into userStore.checkout
      userStore.checkout.push(item);
    }
  });
  console.log(userStore.cartItems);
  console.log("FLAGGGGGGGGGG");
  console.log(userStore.checkout);

  userStore.checkout.forEach((item) => {
    // console.log(item); // Print the item to inspect its properties
    total.value += item.product.price * item.quantity;
  });

});

const removeOrderedItems = (checkout) => {
  const checkoutData = userStore.checkout.map((item) => item.product.id); // Get the list of product IDs in the current checkout
  return checkout.filter((item) => !checkoutData.includes(item.product.id)); // Filter out the ordered items
};

const placeOrder = async () => {
  try {
    // console.log("Placing the order...");

    // Log user and checkout items before creating the order
    // console.log("User ID:", user.value.id); // Log user ID
    //console.log("Checkout items:", userStore.checkout); // Log the checkout items

    setTimeout(() => {
      // console.log("Redirecting to the success page...");
      //navigateTo("/success"); // Redirect to the success page
      window.location.href = "/success";

    }, 100);
    await createOrder();

    // Call createOrder to send the order to the backend

    userStore.checkout = removeOrderedItems(userStore.checkout);

    // Clear the checkout items after placing the order
    //userStore.cart = []; // Clear the cart (optional, if you want to empty the cart after order)
    userStore.checkout = []; // Clear the checkout items
    //  console.log("Checkout items cleared.");
    userStore.refreshFlag = 1;
    await userStore.fetchCartItems();
    await userStore.fetchOrders();

    // Redirect to the success page after a short delay
  } catch (error) {
    console.error("Error placing the order:", error); // Log any error that occurs
  }
};

const createOrder = async () => {
  try {
    console.log("Creating order with the following data:");
    //
    const checkoutData = userStore.checkout.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    // Log the order data before sending it to the backend
    // console.log("Order data:", {
    //   userId: user.value.id,
    //   checkoutItem: checkoutData,
    // });

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
