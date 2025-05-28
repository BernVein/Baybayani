<template>
    <div id="AuthPage" class="flex flex-col items-center w-full min-h-screen bg-white md:flex-row">
        <!-- Logo Section for Desktop -->
        <div class="hidden md:flex items-center justify-center w-full md:w-1/2 h-screen md:h-full bg-gray-100 shadow-lg md:sticky md:top-0">
            <img src="/logo.png" alt="Logo" class="h-full max-h-[90%] p-10 object-contain animate-fade-in" />
        </div>

        <!-- Login Form Section -->
        <div class="w-full md:w-1/2 flex items-center justify-center min-h-screen md:min-h-0 px-4 py-8 relative">
            <div class="w-full max-w-[400px] bg-white bg-opacity-90 rounded-lg shadow-2xl p-8 mx-auto my-4 relative z-10">
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
                        <input type="tel" 
                               id="contact" 
                               v-model="registerContact"
                               @input="validateContactNumber"
                               class="w-full p-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-[#0C6539]"
                               placeholder="Enter phone number" 
                               pattern="[0-9]*"
                               required />
                    </div>

                    <!-- Valid ID Upload -->
                    <div>
                        <label for="validId" class="block text-base md:text-lg pb-2 font-medium text-gray-700">Upload Valid ID</label>
                        <input type="file" 
                               id="validId" 
                               @change="handleFileUpload"
                               accept="image/*,.png"
                               class="w-full p-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-[#0C6539] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#0C6539] file:text-white hover:file:bg-[#0A5230]"
                               required />
                        <p class="mt-1 text-sm text-gray-500">Accepted formats: PNG, JPG, JPEG</p>
                    </div>

                    <div>
                        <label for="role" class="block text-base md:text-lg pb-2 font-medium text-gray-700">Register as</label>
                        <select id="role" v-model="registerRole"
                               class="w-full p-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-[#0C6539]" required>
                            <option value="Buyer">Buyer</option>
                            <option value="Client">Client</option>
                            <option value="Admin">Admin</option>
                        </select>
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
    const registerRole = ref("Buyer"); // Default to Buyer

    // Add new ref for valid ID
    const validIdFile = ref(null);

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
                await userStore.fetchUser();
                
                // Check if user is verified
                if (userStore.profile && userStore.profile.status === 'UNVERIFIED') {
                    // Log the user out immediately
                    await client.auth.signOut();
                    toastMessage.value = "Your account is pending verification by an administrator. Please check back later.";
                    toastClass.value = "bg-yellow-500 text-white";
                    setTimeout(() => {
                        toastMessage.value = null;
                    }, 5000);
                    loading.value = false;
                    return;
                }
                
                // Check if user is suspended
                if (userStore.profile && userStore.profile.status === 'SUSPENDED') {
                    // Log the user out immediately
                    await client.auth.signOut();
                    toastMessage.value = "Your account has been suspended. Please contact the administrator.";
                    toastClass.value = "bg-red-500 text-white";
                    setTimeout(() => {
                        toastMessage.value = null;
                    }, 5000);
                    loading.value = false;
                    return;
                }
                
                // Check if user is inactive
                if (userStore.profile && userStore.profile.status === 'INACTIVE') {
                    // Log the user out immediately
                    await client.auth.signOut();
                    toastMessage.value = "Your account is inactive. Please contact the administrator.";
                    toastClass.value = "bg-gray-500 text-white";
                    setTimeout(() => {
                        toastMessage.value = null;
                    }, 5000);
                    loading.value = false;
                    return;
                }
                
                userStore.isLoading = 1;
                await userStore.fetchCartItems();
                await userStore.fetchOrders();
                toastMessage.value = "Successfully logged in!";
                toastClass.value = "bg-green-500 text-white";

                // Check store hours immediately after login
                // Initialize time settings first
                await userStore.initializeTimeSettings();
                
                // Check if store is closed using Philippines time
                const now = new Date();
                const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
                const phTime = new Date(utcTime + 3600000 * 8); // UTC+8 for Philippines
                
                const currentHour = phTime.getHours();
                const currentMinute = phTime.getMinutes();
                
                // Check if current time is outside operating hours
                const isBeforeOpening =
                    currentHour < userStore.openingHour ||
                    (currentHour === userStore.openingHour &&
                    currentMinute < userStore.openingMinute);
                
                const isAfterClosing =
                    currentHour > userStore.closingHour ||
                    (currentHour === userStore.closingHour &&
                    currentMinute >= userStore.closingMinute);
                
                const isStoreClosed = isBeforeOpening || isAfterClosing;
                
                // Redirect to closed page if store is closed (for non-admin users)
                if (isStoreClosed && !userStore.isAdmin) {
                    return navigateTo("/closed");
                }

                // Otherwise redirect based on role
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

    // Contact number validation
    const validateContactNumber = (event) => {
        // Remove any non-numeric characters
        registerContact.value = event.target.value.replace(/\D/g, '');
    };

    // File upload handler
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file type
            if (!file.type.match('image.*')) {
                toastMessage.value = "Please upload an image file";
                toastClass.value = "bg-red-500 text-white";
                event.target.value = ''; // Clear the input
                return;
            }
            
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toastMessage.value = "File size should be less than 5MB";
                toastClass.value = "bg-red-500 text-white";
                event.target.value = ''; // Clear the input
                return;
            }

            validIdFile.value = file;
        }
    };

    // Update the register function to include the valid ID
    const register = async () => {
        loading.value = true;
        toastMessage.value = null;

        try {
            if (!validIdFile.value) {
                throw new Error('Please upload a valid ID');
            }

            // 1. Create user in Supabase Auth
            const { data, error } = await client.auth.signUp({
                email: registerEmail.value,
                password: registerPassword.value,
                options: {
                    data: {
                        name: registerName.value,
                        contact: registerContact.value,
                        role: registerRole.value
                    }
                }
            });

            if (error) throw error;
            
            // 2. Save user to Prisma database
            if (data.user) {
                const formData = new FormData();
                formData.append('id', data.user.id);
                formData.append('email', registerEmail.value);
                formData.append('name', registerName.value);
                formData.append('contact', registerContact.value);
                formData.append('role', registerRole.value);
                formData.append('status', 'UNVERIFIED');
                formData.append('validId', validIdFile.value);

                const createUserResponse = await fetch('/api/prisma/createUser', {
                    method: 'POST',
                    body: formData
                });

                const createUserResult = await createUserResponse.json();
                if (!createUserResponse.ok) {
                    throw new Error(createUserResult.error || 'Failed to create user record');
                }
            }

            toastMessage.value = "Registration successful! Your account requires admin verification before you can log in.";
            toastClass.value = "bg-green-500 text-white";

            // Reset form
            registerEmail.value = "";
            registerPassword.value = "";
            registerName.value = "";
            registerContact.value = "";
            registerRole.value = "Buyer";
            validIdFile.value = null;
            document.getElementById('validId').value = ''; // Reset file input

            // Switch back to login view
            isLogin.value = true;

        } catch (error) {
            toastMessage.value = "Registration failed: " + error.message;
            toastClass.value = "bg-red-500 text-white";
        } finally {
            loading.value = false;
            setTimeout(() => {
                toastMessage.value = null;
            }, 5000);
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

    @keyframes toast {
        0% { transform: translateX(100%); opacity: 0; }
        10% { transform: translateX(0); opacity: 1; }
        90% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
    }

    .animate-toast {
        animation: toast 3s ease-in-out forwards;
    }

    #AuthPage {
        min-height: 100vh;
        min-height: 100dvh;
    }

    @media (max-width: 768px) {
        #AuthPage {
            padding: 0;
            position: relative;
            overflow-y: auto;
        }

        #AuthPage::before {
            content: '';
            position: fixed;
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
            background-color: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin: 1rem auto;
        }

        /* Form container spacing */
        form.space-y-5 {
            margin-bottom: 1rem;
        }

        /* Input field spacing */
        .space-y-5 > div {
            margin-bottom: 1rem;
        }

        /* Ensure buttons are easily tappable */
        button {
            min-height: 44px;
        }

        /* Improve input readability */
        input, select {
            font-size: 16px !important;
            padding: 12px !important;
        }
    }
</style>