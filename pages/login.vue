<template>
  <div id="AuthPage" class="flex items-center justify-center w-full h-[100vh] bg-white">
    <!-- Logo Section -->
    <div class="flex items-center justify-center w-1/2 h-full bg-gray-100 shadow-lg">
      <img src="/logo.png" alt="Logo" class="h-full max-h-[90%] p-10 object-contain animate-fade-in" />
    </div>

    <!-- Login Form Section -->
    <div class="w-1/2 max-w-[400px] mx-auto px-6">
      <div class="border border-gray-300 rounded-lg shadow-2xl p-8 bg-white animate-slide-in">
        <!-- Page Title -->
        <div class="text-center mb-6 text-3xl font-bold text-[#0C6539]">Welcome Back!</div>

        <!-- Login form-->
        <form @submit.prevent="login" class="space-y-5">
          <div>
            <label for="email" class="block text-lg pb-2 font-medium text-gray-700">Email</label>
            <input type="email" id="email" v-model="email" @input="resetMessages"
              class="w-full p-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-[#0C6539]"
              placeholder="Enter your email" required />
          </div>

          <div>
            <label for="password" class="block text-lg pb-2 font-medium text-gray-700">Password</label>
            <input type="password" id="password" v-model="password" @input="resetMessages"
              class="w-full p-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-[#0C6539]"
              placeholder="Enter your password" required />
          </div>

          <div>
            <button type="submit" :disabled="loading"
              class="w-full py-3 bg-[#0C6539] text-white font-semibold rounded-md hover:bg-[#0A5230] focus:outline-none focus:ring-2 focus:ring-blue-400">
              <span v-if="loading">Logging in...</span>
              <span v-else>Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toastMessage" :class="['fixed top-5 right-5 p-4 rounded shadow-lg', toastClass, 'animate-toast']">
      {{ toastMessage }}
    </div>

    <!-- Loading Component -->
    <Loading v-if="loading" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router"; // To redirect after login
import { useUserStore } from "~/stores/user";
import Loading from "~/components/Loading.vue"; // Import the Loading component
import { navigateTo } from "nuxt/app";
const userStore = useUserStore();
const user = useSupabaseUser();

const router = useRouter();
const client = useSupabaseClient();
const email = ref("");
const password = ref("");
const errorMsg = ref(null);
const successMsg = ref(null);
const loading = ref(false);
const toastMessage = ref(null);
const toastClass = ref("");

const navigateAndReload = async () => {
  await router.push("/"); // Navigate to the route
  window.location.reload(); // Reload the page
};

watchEffect(async () => {
  if (user.value) {
    await navigateTo("/");
  }
});

// Reset error and success messages when user changes input
const resetMessages = () => {
  errorMsg.value = null;
  successMsg.value = null;
  toastMessage.value = null;
};

// Login function
const login = async () => {
  loading.value = true;
  errorMsg.value = null;
  successMsg.value = null;

  try {
    const response = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    console.log("info", response);

    if (response.error) {
      errorMsg.value = response.error.message;
      toastMessage.value = "Login failed: " + response.error.message;
      toastClass.value = "bg-red-500 text-white";
    } else if (response.data.user) {
      const userData = response.data.user.user_metadata?.role || "User";
      await userStore.fetchUser();
      console.log("USEEEEEEEEEEEEEEEEEEERRR");
      userStore.isLoading = 1;
      //await userStore.fetchCartItems();
      console.log("CARTTTTTTTTTTTTTTTTT");
      //await userStore.fetchOrders();
      console.log("ORDERRRRRRRRRRRRR");
      toastMessage.value = "Successfully logged in as " + userData.toLowerCase() + "!";
      toastClass.value = "bg-green-500 text-white";
      console.log("status", userStore.user);
      console.log("ADMIN??????????/", userStore.profile.role);

      if (userStore.isAdmin) {
        router.push("/admin/dashboard").then(() => {
          location.reload(); // Reload after navigating to the dashboard
        });
      } else {
        router.push("/");
      }
    }
  } catch (error) {
    errorMsg.value = error.message;
    toastMessage.value = "Login failed: " + error.message;
    toastClass.value = "bg-red-500 text-white";
  } finally {
    loading.value = false;
    setTimeout(() => {
      toastMessage.value = null;
    }, 3000); // Hide toast after 3 seconds
  }
};
</script>

<style scoped>
/* Subtle animations */
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
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

.animate-slide-in {
  animation: slideIn 0.5s ease-out;
}

/* Toast animations */
@keyframes toastIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toastOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }

  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-toast {
  animation: toastIn 0.5s ease-out, toastOut 0.5s ease-in 2.5s forwards;
}
</style>