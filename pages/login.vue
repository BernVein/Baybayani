<template>
  <div id="AuthPage" class="w-full h-[100vh] bg-white">
    <!-- Header with logo -->
    <div
      class="w-full flex items-center justify-center p-5 border-b border-b-gray-300 shadow-[0px_1px_6px_4px_rgba(0,_0,_0,_0.25)]"
    >
      <NuxtLink to="/" class="min-w-[170px]" @click.prevent="navigateAndReload">
        <img width="170" src="/baybayani-logo.png" alt="Logo" />
      </NuxtLink>
    </div>

    <div
      class="max-w-[400px] mx-auto px-2 border border-gray-300 rounded-lg pb-32 mt-10 shadow-[15px_15px_0px_1px_rgba(12,_101,_57,_1)]"
    >
      <!-- Page Title -->
      <div class="text-center my-6 text-2xl font-bold">Login</div>

      <!-- Error message -->
      <div v-if="errorMsg" class="text-red-500 text-center mb-4">
        {{ errorMsg }}
      </div>

      <!-- Success message -->
      <div v-if="successMsg" class="text-green-500 text-center mb-4">
        {{ successMsg }}
      </div>

      <!-- Login form-->
      <form
        @submit.prevent="login"
        class="space-y-5 w-[350px] flex flex-col items-center ml-3"
      >
        <div>
          <label
            for="email"
            class="block text-lg pb-2 mt-3 font-medium text-gray-700"
            >Email</label
          >
          <!-- Adjusted width of the input -->
          <input
            type="email"
            id="email"
            v-model="email"
            @input="resetMessages"
            class="mt-1 w-[300px] mx-auto p-3 border border-gray-400 rounded-md"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-lg pb-2 font-medium text-gray-700"
            >Password</label
          >
          <!-- Adjusted width of the input -->
          <input
            type="password"
            id="password"
            v-model="password"
            @input="resetMessages"
            class="mt-1 w-[300px] mx-auto p-3 border border-gray-400 rounded-md"
            placeholder="Enter your password"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-[300px] mt-10 mx-auto py-3 border-2 border-[#0C6539] text-[#0C6539] font-semibold rounded-md hover:bg-[#0C6539] hover:text-[#fafafa] focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <span v-if="loading">Logging in...</span>
            <span v-else>Login</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router"; // To redirect after login
import { useUserStore } from "~/stores/user";
const userStore = useUserStore();
const user = useSupabaseUser();

const router = useRouter();
const client = useSupabaseClient();
const email = ref("");
const password = ref("");
const errorMsg = ref(null);
const successMsg = ref(null);
const loading = ref(false);

watchEffect(async () => {
  if (user.value) {
    await navigateTo("/");
  }
});

const navigateAndReload = async () => {
  await router.push("/"); // Navigate to the route
  window.location.reload(); // Reload the page
};

// Reset error and success messages when user changes input
const resetMessages = () => {
  errorMsg.value = null;
  successMsg.value = null;
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
    const userData = response.data.user.user_metadata.role;
    console.log(userData);
    const { error } = response;
    // ...
    if (error) {
      errorMsg.value = error.message;
      successMsg.value = null;
    } else {
      await userStore.fetchUser();
      successMsg.value =
        "Successfully logged in as " + userData.toLowerCase() + "!";
      errorMsg.value = null;

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
    successMsg.value = null;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* You can add additional custom styling here if needed */
</style>
