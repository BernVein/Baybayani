<template>
  <div class="flex h-screen">
    <!-- Sidebar Layout -->
    <SideBarLayout class="sidebar" />

    <!-- Admin Layout -->
    <AdminLayout class="admin-layout">
      <div class="main-content flex-1 overflow-y-auto p-6">
        <!-- Title -->
        <h1 class="text-3xl font-semibold mb-8">User Management</h1>

        <!-- User Stats Boxes -->
        <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
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
        </div>

        <!-- Search and Add User -->
        <div class="flex justify-between items-center mb-4">
          <!-- Search Input with Icon -->
          <div class="relative w-[350px]">
            <input
              v-model="searchQuery"
              @keydown.enter="searchUsers"
              type="text"
              placeholder="Search users..."
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <Icon
              name="ph:magnifying-glass"
              size="24"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          <!-- Add User Button -->
          <button
            @click="openRegisterModal"
            class="px-12 py-3 font-semibold border border-green-600 text-green-600 rounded-md hover:bg-green-600 hover:text-white flex items-center space-x-3 group"
          >
            <Icon
              name="ph:plus-bold"
              size="18"
              class="text-green-600 group-hover:text-white"
            />
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
                <th class="py-3 px-4 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading Spinner -->
              <tr v-if="loading" class="text-center">
                <td colspan="5" class="py-4">Loading users...</td>
              </tr>

              <!-- Users -->
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="hover:bg-gray-200 hover:scale-[1.02] transition duration-150 ease-in-out"
              >
                <td class="py-4 px-4 border-b text-left truncate">{{ user.name }}</td>
                <td class="py-4 px-4 border-b text-left truncate">{{ user.contact }}</td>
                <td class="py-4 px-4 border-b text-left truncate">{{ user.email }}</td>
                <td class="py-4 px-4 border-b text-left">{{ (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) }}</td>
                <td class="py-4 px-4 border-b text-center">
                  <button @click="deleteUser(user.email)" class="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>

    <!-- Register Modal -->
    <div
      v-if="isRegisterModalVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
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
              <input
                type="email"
                id="email"
                v-model="email"
                class="mt-1 w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter email"
                required
              />
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                v-model="password"
                class="mt-1 w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter password"
                required
              />
            </div>

            <!-- Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                v-model="name"
                class="mt-1 w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter name"
                required
              />
            </div>

            <!-- Contact Number -->
            <div>
              <label for="contact" class="block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="text"
                id="contact"
                v-model="contact"
                class="mt-1 w-full p-3 border border-gray-300 rounded-md"
                placeholder="Enter contact number"
                required
              />
            </div>

            <!-- Role -->
            <div>
              <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
              <select
                id="role"
                v-model="role"
                class="mt-1 w-full p-3 border border-gray-300 rounded-md"
                required
              >
                <option value="" disabled>Select role</option>
                <option value="Buyer">Buyer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                class="w-full py-3 bg-white border border-green-600 text-green-600 rounded-md hover:bg-green-600 hover:text-white"
              >
                Register
              </button>
            </div>
          </form>
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
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const user = useSupabaseUser();
const route = useRoute();

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

// State for users
const users = ref([]);

// User statistics
const buyers = ref(0);
const suspendedUsers = ref(0);

watchEffect(() => {
  if (
    route.fullPath == "/admin/users" &&
    (!user.value || userStore.isAdmin === false)
  ) {
    navigateTo("/login");
  }
});

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
  suspendedUsers.value = users.value.filter((user) => user.status === "Suspended").length;
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
    alert("All fields are required.");
    return;
  }

  const { $supabase } = useNuxtApp();

  try {
    const { data, error } = await $supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          name: name.value,
          contact: contact.value,
          role: role.value,
        },
      },
    });

    if (error) {
      console.error(`Registration failed: ${error.message}`);
      errorMsg.value = error.message;
      return;
    }

    console.log("Successfully registered!", data);
    successMsg.value = "Successfully registered!";
    fetchUsers(); // Fetch updated users after registration
    closeRegisterModal();
  } catch (err) {
    console.error(`An unexpected error occurred: ${err.message}`);
    errorMsg.value = err.message;
  }
};

// Delete User Function
const deleteUser = async (userEmail) => {
  if (confirm("Are you sure you want to delete this user?")) {
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
        alert("Failed to delete user: " + result.message);
        return;
      }

      console.log("User deleted successfully");
      alert("User deleted successfully");

      // Fetch the users again to update the UI
      fetchUsers();
    } catch (err) {
      console.error("Unexpected error occurred while deleting user:", err);
      alert("Unexpected error occurred: " + err.message);
    }
  }
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
</script>

<style scoped>
.main-content {
  padding-top: 100px;
}

button:hover .group-hover\:text-white {
  color: white;
}
</style>
