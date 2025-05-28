<template>
    <div class="flex h-screen overflow-hidden">
        <!-- Sidebar Layout -->
        <SideBarLayout class="sidebar flex-shrink-0" />

        <!-- Admin Layout -->
        <AdminLayout class="flex-1 overflow-hidden">
            <div class="main-content h-full overflow-y-auto p-6 max-w-[calc(100vw-256px)]">
                <!-- Title -->
                <h1 class="text-3xl font-semibold mb-8">User Management</h1>

                <!-- User Stats Boxes -->
                <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    <!-- Total Users -->
                    <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-red-600">
                        <p class="text-lg font-medium">Total Users</p>
                        <p class="text-4xl font-bold">{{ totalUsers }}</p>
                    </div>

                    <!-- Buyers -->
                    <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-blue-600">
                        <p class="text-lg font-medium">Buyers</p>
                        <p class="text-4xl font-bold">{{ buyers }}</p>
                    </div>

                    <!-- Suspended Users -->
                    <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-yellow-600">
                        <p class="text-lg font-medium">Suspended Users</p>
                        <p class="text-4xl font-bold">{{ suspendedUsers }}</p>
                    </div>
                    
                    <!-- Unverified Users -->
                    <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-orange-600">
                        <p class="text-lg font-medium">Unverified Users</p>
                        <p class="text-4xl font-bold">{{ unverifiedUsers }}</p>
                    </div>
                </div>

                <!-- Search and Add User -->
                <div class="flex justify-between items-center mb-4">
                    <!-- Search Input with Icon -->
                    <div class="relative w-[350px]">
                        <input v-model="searchQuery"
                               @keydown.enter="searchUsers"
                               type="text"
                               placeholder="Search users..."
                               class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600" />
                        <Icon name="ph:magnifying-glass"
                              size="24"
                              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <!-- Add User Button -->
                    <button @click="openRegisterModal"
                            class="px-12 py-3 font-semibold border border-green-600 text-green-600 rounded-md hover:bg-green-600 hover:text-white flex items-center space-x-3 group">
                        <Icon name="ph:plus-bold"
                              size="18"
                              class="text-green-600 group-hover:text-white" />
                        <span class="group-hover:text-white">Add User</span>
                    </button>
                </div>

                <!-- User Table -->
                <div class="overflow-x-auto bg-white border border-gray-300 rounded-md shadow-sm">
                    <table class="w-full table-auto">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="py-3 px-4 text-left font-semibold text-gray-700">Name</th>
                                <th class="py-3 px-4 text-left font-semibold text-gray-700">Contact Number</th>
                                <th class="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
                                <th class="py-3 px-4 text-left font-semibold text-gray-700">Role</th>
                                <th class="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                                <th class="py-3 px-4 text-center font-semibold text-gray-700">Valid ID</th>
                                <th class="py-3 px-4 text-center font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Loading Spinner -->
                            <tr v-if="loading" class="text-center">
                                <td colspan="7" class="py-4">Loading users...</td>
                            </tr>

                            <!-- Users -->
                            <tr v-for="user in filteredUsers"
                                :key="user.id"
                                class="hover:bg-gray-200 transition duration-150 ease-in-out cursor-pointer"
                                @click="openUserDetailsModal(user)">
                                <td class="py-4 px-4 border-b text-left truncate">{{ user.name }}</td>
                                <td class="py-4 px-4 border-b text-left truncate">{{ user.contact }}</td>
                                <td class="py-4 px-4 border-b text-left truncate">{{ user.email }}</td>
                                <td class="py-4 px-4 border-b text-left">{{ (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) }}</td>
                                <td class="py-4 px-4 border-b text-left">
                                    <span :class="{
                                        'px-2 py-1 rounded-full text-xs font-semibold': true,
                                        'bg-green-100 text-green-800': user.status === 'ACTIVE',
                                        'bg-red-100 text-red-800': user.status === 'SUSPENDED',
                                        'bg-yellow-100 text-yellow-800': user.status === 'UNVERIFIED',
                                        'bg-gray-100 text-gray-800': user.status === 'INACTIVE'
                                    }">
                                        {{ user.status }}
                                    </span>
                                </td>
                                <td class="py-4 px-4 border-b text-center">
                                    <button @click.stop="openValidIdModal(user)" 
                                            class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 border border-blue-300 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <span class="flex items-center">
                                            <Icon name="ph:eye" class="mr-1" size="16" />
                                            View
                                        </span>
                                    </button>
                                </td>
                                <td class="py-4 px-4 border-b text-center">
                                    <div class="flex justify-center gap-2" @click.stop>
                                        <button v-if="user.status === 'UNVERIFIED'" 
                                                @click="verifyUser(user.email)" 
                                                class="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200 border border-green-300 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500">
                                            <span class="flex items-center">
                                                <Icon name="ph:check-circle" class="mr-1" size="16" />
                                                Verify
                                            </span>
                                        </button>
                                        <button v-if="user.status === 'ACTIVE'" 
                                                @click="suspendUser(user.email)" 
                                                class="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 border border-red-300 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500">
                                            <span class="flex items-center">
                                                <Icon name="ph:prohibit" class="mr-1" size="16" />
                                                Suspend
                                            </span>
                                        </button>
                                        <button v-if="user.status === 'SUSPENDED' || user.status === 'INACTIVE'" 
                                                @click="reactivateUser(user.email)" 
                                                class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 border border-blue-300 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <span class="flex items-center">
                                                <Icon name="ph:arrows-clockwise" class="mr-1" size="16" />
                                                Reactivate
                                            </span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>

        <!-- Toast Notifications -->
        <div class="fixed top-24 right-4 z-50">
            <div v-for="toast in toasts" :key="toast.id"
            class="mb-2 p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in" 
            :class="{
                'bg-green-500 text-white': toast.type === 'success',
                'bg-red-500 text-white': toast.type === 'error',
                'bg-yellow-500 text-white': toast.type === 'warning',
                'bg-blue-500 text-white': toast.type === 'info'
            }">
            {{ toast.message }}
            </div>
        </div>
        
        <!-- Confirmation Toast -->
        <div v-if="confirmationToast.show" class="fixed top-24 right-4 z-50">
            <div class="mb-2 p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in bg-white border border-gray-300">
                <div class="flex flex-col">
                    <div class="mb-3 font-medium">{{ confirmationToast.message }}</div>
                    <div class="flex justify-end gap-2">
                        <button @click="confirmationToast.onCancel()" 
                                class="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300">
                            Cancel
                        </button>
                        <button @click="confirmationToast.onConfirm()" 
                                :class="{
                                    'px-3 py-1 text-white rounded-md border': true,
                                    'bg-green-500 hover:bg-green-600 border-green-600': confirmationToast.type === 'verify',
                                    'bg-red-500 hover:bg-red-600 border-red-600': confirmationToast.type === 'suspend',
                                    'bg-blue-500 hover:bg-blue-600 border-blue-600': confirmationToast.type === 'reactivate'
                                }">
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Register Modal -->
        <div v-if="isRegisterModalVisible"
             class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white w-full max-w-[600px] p-6 rounded-md shadow-lg relative">
                <!-- Close Button -->
                <button @click="closeRegisterModal" class="absolute top-3 right-3 text-gray-500 hover:text-gray-800">✕</button>

                <!-- Registration Form -->
                <div>
                    <div class="text-center my-6 text-2xl font-bold">Register</div>

                    <!-- Error Message -->
                    <div v-if="errorMsg" class="text-red-500 text-center mb-4">
                        {{ errorMsg }}
                    </div>

                    <!-- Success Message -->
                    <div v-if="successMsg" class="text-green-500 text-center mb-4">
                        {{ successMsg }}
                    </div>

                    <form @submit.prevent="register" class="space-y-4">
                        <!-- Email -->
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email"
                                   id="email"
                                   v-model="email"
                                   class="mt-1 w-full p-3 border border-gray-300 rounded-md"
                                   placeholder="Enter email"
                                   required />
                        </div>

                        <!-- Password -->
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password"
                                   id="password"
                                   v-model="password"
                                   class="mt-1 w-full p-3 border border-gray-300 rounded-md"
                                   placeholder="Enter password"
                                   required />
                        </div>

                        <!-- Name -->
                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text"
                                   id="name"
                                   v-model="name"
                                   class="mt-1 w-full p-3 border border-gray-300 rounded-md"
                                   placeholder="Enter name"
                                   required />
                        </div>

                        <!-- Contact Number -->
                        <div>
                            <label for="contact" class="block text-sm font-medium text-gray-700">Contact Number</label>
                            <input type="text"
                                   id="contact"
                                   v-model="contact"
                                   class="mt-1 w-full p-3 border border-gray-300 rounded-md"
                                   placeholder="Enter contact number"
                                   required />
                        </div>

                        <!-- Role -->
                        <div>
                            <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
                            <select id="role"
                                    v-model="role"
                                    class="mt-1 w-full p-3 border border-gray-300 rounded-md"
                                    required>
                                <option value="" disabled>Select role</option>
                                <option value="Buyer">Buyer</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        <!-- Submit Button -->
                        <div>
                            <button type="submit"
                                    class="w-full py-3 bg-white border border-green-600 text-green-600 rounded-md hover:bg-green-600 hover:text-white">
                                Register
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- User Details Modal -->
        <div v-if="isUserDetailsModalVisible" 
             class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white w-full max-w-[600px] p-6 rounded-md shadow-lg relative max-h-[80vh] overflow-y-auto">
                <!-- Close Button -->
                <button @click="closeUserDetailsModal" 
                        class="absolute top-3 right-3 text-gray-500 hover:text-gray-800">✕</button>

                <!-- User Details Content -->
                <div v-if="selectedUser" class="space-y-6">
                    <h2 class="text-2xl font-bold text-center mb-6">User Details</h2>
                    
                    <!-- Profile Section -->
                    <div class="space-y-4">
                        <div class="flex items-center justify-center mb-6">
                            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <Icon name="ph:user" size="40" class="text-green-600" />
                            </div>
                        </div>

                        <!-- User Information -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-600">Name</p>
                                <p class="font-medium">{{ selectedUser.name }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Contact</p>
                                <p class="font-medium">{{ selectedUser.contact }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Email</p>
                                <p class="font-medium">{{ selectedUser.email }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Role</p>
                                <p class="font-medium">{{ selectedUser.role }}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Status</p>
                                <span :class="{
                                    'px-2 py-1 rounded-full text-xs font-semibold': true,
                                    'bg-green-100 text-green-800': selectedUser.status === 'ACTIVE',
                                    'bg-red-100 text-red-800': selectedUser.status === 'SUSPENDED',
                                    'bg-yellow-100 text-yellow-800': selectedUser.status === 'UNVERIFIED',
                                    'bg-gray-100 text-gray-800': selectedUser.status === 'INACTIVE'
                                }">
                                    {{ selectedUser.status }}
                                </span>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Created At</p>
                                <p class="font-medium">{{ formatDate(selectedUser.created_at) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Valid ID Modal -->
        <div v-if="isValidIdModalVisible"
             class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white w-full max-w-[800px] p-6 rounded-md shadow-lg relative">
                <!-- Close Button -->
                <button @click="closeValidIdModal"
                        class="absolute top-3 right-3 text-gray-500 hover:text-gray-800">✕</button>

                <h2 class="text-2xl font-bold text-center mb-6">Valid ID</h2>

                <!-- Valid ID Image -->
                <div v-if="selectedUser && selectedUser.validId" class="flex justify-center">
                    <img :src="'data:image/jpeg;base64,' + selectedUser.validId" 
                         alt="Valid ID" 
                         class="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg" />
                </div>
                <div v-else class="text-center text-gray-500 py-8">
                    No valid ID available
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from "vue";
    import { useNuxtApp } from "#app";
    import AdminLayout from "~/layouts/AdminLayout.vue";
    import SideBarLayout from "~/layouts/SideBarLayout.vue";

    // Modal Visibility
    const isRegisterModalVisible = ref(false);
    const loading = ref(true); // Loading state

    // State for form inputs
    const email = ref("");
    const password = ref("");
    const name = ref("");
    const contact = ref("");
    const role = ref("");
    const errorMsg = ref(null);
    const successMsg = ref(null);

    // Toast notification state
    const toasts = ref([]);
    
    // Confirmation toast
    const confirmationToast = ref({
        show: false,
        message: '',
        type: '', // 'verify', 'suspend', 'reactivate'
        onConfirm: () => {},
        onCancel: () => {
            confirmationToast.value.show = false;
        }
    });
    
    // Function to show confirmation toast
    const showConfirmation = (message, type, onConfirm) => {
        confirmationToast.value = {
            show: true,
            message,
            type,
            onConfirm: () => {
                confirmationToast.value.show = false;
                onConfirm();
            },
            onCancel: () => {
                confirmationToast.value.show = false;
            }
        };
    };
    
    // Function to show toast notification
    const showToast = (message, type = 'success') => {
        const id = Date.now();
        toasts.value.push({ id, message, type });
        setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== id);
        }, 3000);
    };

    // State for users
    const users = ref([]);

    // State for user statistics
    const buyers = ref(0);
    const suspendedUsers = ref(0);
    const unverifiedUsers = ref(0);

    // Fetch users from Prisma API
    const fetchUsers = async () => {
        console.log("Fetching users...");
        loading.value = true;

        try {
            const response = await fetch("/api/prisma/users");
            const result = await response.json();

            if (response.ok && result.success) {
                console.log("Users fetched successfully:", result.data);
                users.value = [...result.data]; // Use spread operator to force reactivity update
                updateStats(); // Update the stats after fetching users
            } else {
                console.error("Failed to fetch users:", result.message);
                errorMsg.value = result.message || "Failed to fetch users.";
            }
        } catch (err) {
            console.error("Unexpected error occurred while fetching users:", err);
            errorMsg.value = err.message;
        } finally {
            loading.value = false;
        }
    };

    // Function to update statistics for user roles
    const updateStats = () => {
        buyers.value = users.value.filter((user) => user.role === "Buyer").length;
        suspendedUsers.value = users.value.filter((user) => user.status === "SUSPENDED").length;
        unverifiedUsers.value = users.value.filter((user) => user.status === "UNVERIFIED").length;
    };

    // Lifecycle hook to load users when the component is mounted
    onMounted(() => {
        fetchUsers();
    });

    // Computed property to calculate total users
    const totalUsers = computed(() => users.value.length);

    // Methods to handle modal visibility
    const openRegisterModal = () => {
        isRegisterModalVisible.value = true;
    };

    const closeRegisterModal = () => {
        isRegisterModalVisible.value = false;
        clearForm();
    };

    // Clear form fields
    const clearForm = () => {
        email.value = "";
        password.value = "";
        name.value = "";
        contact.value = "";
        role.value = "";
        errorMsg.value = null;
        successMsg.value = null;
    };

    // Register method using Supabase from plugin
    const register = async () => {
        if (!email.value || !password.value || !name.value || !contact.value || !role.value) {
            showToast("All fields are required", "error");
            return;
        }

        loading.value = true;
        let authData = null;

        try {
            const supabase = useSupabaseClient();

            // 1. Create user in Supabase Auth (with email confirmation disabled)
            const { data, error: authError } = await supabase.auth.signUp({
                email: email.value,
                password: password.value,
                options: {
                    emailRedirectTo: window.location.origin,
                    data: {
                        name: name.value,
                        contact: contact.value,
                        role: role.value
                    }
                }
            });

            if (authError) throw authError;
            authData = data;

            // 2. Immediately confirm the user (skip email verification)
            if (authData.user) {
                await supabase.auth.admin.updateUserById(authData.user.id, {
                    email_confirm: true
                });
            }

            // 3. Create user in Prisma database via API
            const response = await fetch('/api/prisma/createUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: authData.user?.id,
                    email: email.value,
                    name: name.value,
                    contact: contact.value,
                    role: role.value,
                    status: 'ACTIVE'
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to create user in database");
            }

            showToast("User created successfully!", "success");
            fetchUsers(); // Refresh the user list
            closeRegisterModal();

        } catch (error) {
            console.error("Registration error:", error);
            showToast(error.message || "Registration failed", "error");

            // If auth succeeded but Prisma failed, try to clean up
            if (authData?.user?.id) {
                const supabase = useSupabaseClient();
                await supabase.auth.admin.deleteUser(authData.user.id).catch(console.error);
            }
        } finally {
            loading.value = false;
        }
    };

    // Delete User Function
    const deleteUser = async (userEmail) => {
        showConfirmation("Are you sure you want to delete this user?", "suspend", async () => {
            console.log("Deleting user with email:", userEmail);

            try {
                const response = await fetch('/api/prisma/deleteUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: userEmail }),
                });

                const result = await response.json();

                if (!response.ok) {
                    console.error("Failed to delete user:", result.message);
                    showToast("Failed to delete user: " + result.message, "error");
                    return;
                }

                console.log("User deleted successfully");
                showToast("User deleted successfully", "success");

                // Fetch the users again to update the UI
                fetchUsers();
            } catch (err) {
                console.error("Unexpected error occurred while deleting user:", err);
                showToast("Unexpected error occurred: " + err.message, "error");
            }
        });
    };

    // Verify User Function
    const verifyUser = async (userEmail) => {
        showConfirmation("Are you sure you want to verify this user?", "verify", async () => {
            console.log("Verifying user with email:", userEmail);

            try {
                const response = await fetch('/api/prisma/updateUserStatus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        email: userEmail,
                        status: 'ACTIVE'
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    console.error("Failed to verify user:", result.message);
                    showToast("Failed to verify user: " + result.message, "error");
                    return;
                }

                console.log("User verified successfully");
                showToast("User verified successfully", "success");

                // Fetch the users again to update the UI
                fetchUsers();
            } catch (err) {
                console.error("Unexpected error occurred while verifying user:", err);
                showToast("Unexpected error occurred: " + err.message, "error");
            }
        });
    };

    // Suspend User Function
    const suspendUser = async (userEmail) => {
        showConfirmation("Are you sure you want to suspend this user? They will not be able to log in.", "suspend", async () => {
            console.log("Suspending user with email:", userEmail);

            try {
                const response = await fetch('/api/prisma/updateUserStatus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        email: userEmail,
                        status: 'SUSPENDED'
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    console.error("Failed to suspend user:", result.message);
                    showToast("Failed to suspend user: " + result.message, "error");
                    return;
                }

                console.log("User suspended successfully");
                showToast("User suspended successfully", "warning");

                // Fetch the users again to update the UI
                fetchUsers();
            } catch (err) {
                console.error("Unexpected error occurred while suspending user:", err);
                showToast("Unexpected error occurred: " + err.message, "error");
            }
        });
    };

    // Reactivate User Function
    const reactivateUser = async (userEmail) => {
        showConfirmation("Are you sure you want to reactivate this user?", "reactivate", async () => {
            console.log("Reactivating user with email:", userEmail);

            try {
                const response = await fetch('/api/prisma/updateUserStatus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        email: userEmail,
                        status: 'ACTIVE'
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    console.error("Failed to reactivate user:", result.message);
                    showToast("Failed to reactivate user: " + result.message, "error");
                    return;
                }

                console.log("User reactivated successfully");
                showToast("User reactivated successfully", "info");

                // Fetch the users again to update the UI
                fetchUsers();
            } catch (err) {
                console.error("Unexpected error occurred while reactivating user:", err);
                showToast("Unexpected error occurred: " + err.message, "error");
            }
        });
    };

    // Computed property for filtered users
    const filteredUsers = computed(() => {
        if (!searchQuery.value.trim()) {
            return users.value;
        }
        return users.value.filter(user =>
            user.name.toLowerCase().includes(searchQuery.value.trim().toLowerCase())
        );
    });

    const searchQuery = ref("");

    // Add these new refs for modals
    const isUserDetailsModalVisible = ref(false);
    const isValidIdModalVisible = ref(false);
    const selectedUser = ref(null);

    // Function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Functions to handle user details modal
    const openUserDetailsModal = (user) => {
        selectedUser.value = user;
        isUserDetailsModalVisible.value = true;
    };

    const closeUserDetailsModal = () => {
        selectedUser.value = null;
        isUserDetailsModalVisible.value = false;
    };

    // Functions to handle valid ID modal
    const openValidIdModal = (user) => {
        selectedUser.value = user;
        isValidIdModalVisible.value = true;
    };

    const closeValidIdModal = () => {
        selectedUser.value = null;
        isValidIdModalVisible.value = false;
    };
</script>

<style scoped>
    .sidebar {
        width: 256px; /* Fixed width for sidebar */
        flex-shrink: 0;
    }

    .main-content {
        width: 100%;
        margin: 0 auto;
    }

    /* Ensure table container doesn't overflow */
    .overflow-x-auto {
        width: 100%;
        max-width: 100%;
    }

    /* Make table fill container width */
    table {
        width: 100%;
        table-layout: fixed;
    }

    /* Add column widths */
    th, td {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    th:nth-child(1), td:nth-child(1) { width: 15%; } /* Name */
    th:nth-child(2), td:nth-child(2) { width: 15%; } /* Contact */
    th:nth-child(3), td:nth-child(3) { width: 20%; } /* Email */
    th:nth-child(4), td:nth-child(4) { width: 10%; } /* Role */
    th:nth-child(5), td:nth-child(5) { width: 15%; } /* Status */
    th:nth-child(6), td:nth-child(6) { width: 12%; } /* Valid ID */
    th:nth-child(7), td:nth-child(7) { width: 13%; } /* Actions */

    /* Add responsive padding for smaller screens */
    @media (max-width: 1024px) {
        .main-content {
            padding: 1rem;
        }
    }

    button:hover .group-hover\:text-white {
        color: white;
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

    .animate-slide-in {
        animation: slideIn 0.3s ease-out;
    }
</style>