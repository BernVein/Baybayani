<template>
    <div id="AuthPage" class="flex flex-col items-center justify-center w-full h-screen bg-white md:flex-row">
        <!-- Logo Section for Desktop -->
        <div class="hidden md:flex items-center justify-center w-full md:w-1/2 h-1/3 md:h-full bg-gray-100 shadow-lg">
            <img src="/logo.png" alt="Logo" class="h-full max-h-[90%] p-10 object-contain animate-fade-in" />
        </div>

        <!-- Login Form Section -->
        <div class="w-full md:w-1/2 max-w-[400px] mx-auto px-6 relative z-10 bg-white bg-opacity-90 rounded-lg shadow-2xl p-8">
            <!-- Toggle between Login and Register -->
            <div class="flex justify-center mb-6">
                <button @click="isLogin = true"
                        :class="['px-4 py-2 font-medium', isLogin ? 'text-[#0C6539] border-b-2 border-[#0C6539]' : 'text-gray-500']">
                    Login
                </button>
                <button @click="isLogin = false"
                        :class="['px-4 py-2 font-medium', !isLogin ? 'text-[#0C6539] border-b-2 border-[#0C6539]' : 'text-gray-500']">
                    Register
                </button>
            </div>

            <!-- Login Form -->
            <form @submit.prevent="login" v-if="isLogin" class="space-y-5">
                <div>
                    <label for="email" class="block text-base md:text-lg pb-2 font-medium text-gray-700">Email</label>
                    <input type="email" id="email" v-model="email" @input="resetMessages"
                           class="w-full p-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-[#0C6539]"
                           placeholder="Enter your email" required />
                </div>

                <div>
                    <label for="password" class="block text-base md:text-lg pb-2 font-medium text-gray-700">Password</label>
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

            <!-- Registration Form -->
            <form @submit.prevent="register" v-else class="space-y-5">
                <div>
                    <label for="reg-email" class="block text-base md:text-lg pb-2 font-medium text-gray-700">Email</label>
                    <input type="email" id="reg-email" v-model="registerEmail"
                           class="w-full p-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-[#0C6539]"
                           placeholder="Enter your email" required />
                </div>

                <div>
                    <label for="reg-password" class="block text-base md:text-lg pb-2 font-medium text-gray-700">Password</label>
                    <input type="password" id="reg-password" v-model="registerPassword"
                           class="w-full p-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-[#0C6539]"
                           placeholder="Create a password" required />
                </div>

                <div>
                    <label for="name" class="block text-base md:text-lg pb-2 font-medium text-gray-700">Full Name</label>
                    <input type="text" id="name" v-model="registerName"
                           class="w-full p-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-[#0C6539]"
                           placeholder="Enter your full name" required />
                </div>

                <div>
                    <label for="contact" class="block text-base md:text-lg pb-2 font-medium text-gray-700">Contact Number</label>
                    <input type="text" id="contact" v-model="registerContact"
                           class="w-full p-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-[#0C6539]"
                           placeholder="Enter phone number" required />
                </div>

                <div>
                    <button type="submit" :disabled="loading"
                            class="w-full py-3 bg-[#0C6539] text-white font-semibold rounded-md hover:bg-[#0A5230] focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <span v-if="loading">Creating account...</span>
                        <span v-else>Register</span>
                    </button>
                </div>
            </form>

            <!-- Toast Notification -->
            <div v-if="toastMessage" :class="['fixed top-5 right-5 p-4 rounded shadow-lg', toastClass, 'animate-toast']">
                {{ toastMessage }}
            </div>

            <!-- Loading Component -->
            <Loading v-if="loading" />
        </div>
    </div>
</template>

<script setup>
    import { ref } from "vue";
    import { useRouter } from "vue-router";
    import { useUserStore } from "~/stores/user";
    import Loading from "~/components/Loading.vue";
    import { navigateTo } from "nuxt/app";

    const userStore = useUserStore();
    const router = useRouter();
    const client = useSupabaseClient();

    // Login state
    const isLogin = ref(true);
    const email = ref("");
    const password = ref("");
    const loading = ref(false);
    const toastMessage = ref(null);
    const toastClass = ref("");

    // Registration state
    const registerEmail = ref("");
    const registerPassword = ref("");
    const registerName = ref("");
    const registerContact = ref("");

    // Login function (existing - kept exactly as is)
    const login = async () => {
        loading.value = true;
        toastMessage.value = null;

        try {
            const response = await client.auth.signInWithPassword({
                email: email.value,
                password: password.value,
            });

            if (response.error) {
                toastMessage.value = "Login failed: " + response.error.message;
                toastClass.value = "bg-red-500 text-white";
            } else if (response.data.user) {
                const userData = response.data.user.user_metadata?.role || "User";
                await userStore.fetchUser();
                userStore.isLoading = 1;
                await userStore.fetchCartItems();
                await userStore.fetchOrders();
                toastMessage.value = "Successfully logged in as " + userData.toLowerCase() + "!";
                toastClass.value = "bg-green-500 text-white";

                if (userStore.isAdmin) {
                    router.push("/admin/dashboard").then(() => {
                        location.reload();
                    });
                } else {
                    router.push("/");
                }
            }
        } catch (error) {
            toastMessage.value = "Login failed: " + error.message;
            toastClass.value = "bg-red-500 text-white";
        } finally {
            loading.value = false;
            setTimeout(() => {
                toastMessage.value = null;
            }, 3000);
        }
    };

    // New registration function (only addition)
    const register = async () => {
        loading.value = true;
        toastMessage.value = null;

        try {
            const { data, error } = await client.auth.signUp({
                email: registerEmail.value,
                password: registerPassword.value,
                options: {
                    data: {
                        name: registerName.value,
                        contact: registerContact.value,
                        role: 'Buyer' // Default role for new registrations
                    }
                }
            });

            if (error) throw error;

            toastMessage.value = "Registration successful! Please check your email to verify your account.";
            toastClass.value = "bg-green-500 text-white";

            // Reset form
            registerEmail.value = "";
            registerPassword.value = "";
            registerName.value = "";
            registerContact.value = "";

            // Switch back to login view
            isLogin.value = true;

        } catch (error) {
            toastMessage.value = "Registration failed: " + error.message;
            toastClass.value = "bg-red-500 text-white";
        } finally {
            loading.value = false;
            setTimeout(() => {
                toastMessage.value = null;
            }, 3000);
        }
    };

    const resetMessages = () => {
        toastMessage.value = null;
    };
</script>

<style scoped>
    /* Your existing styles remain completely unchanged */
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

    @media (max-width: 768px) {
        #AuthPage {
            position: relative;
            overflow: hidden;
            padding: 20px;
        }

            #AuthPage::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url('/logo.png');
                background-size: cover;
                background-position: center;
                filter: blur(8px);
                z-index: 0;
            }

        .relative.z-10 {
            position: relative;
            z-index: 10;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 8px;
            padding: 16px;
            margin: 0 10px;
        }

        .text-center {
            font-size: 1.5rem;
        }

        .block {
            font-size: 0.8rem;
        }

        .w-full {
            padding: 8px;
        }

        .py-3 {
            padding: 8px;
        }
    }
</style>