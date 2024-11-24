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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Users -->
          <div
            class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-red-600"
          >
            <p class="text-lg font-medium">Total Users</p>
            <p class="text-4xl font-bold">{{ totalUsers }}</p>
          </div>

          <!-- Farmers -->
          <div
            class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-green-600"
          >
            <p class="text-lg font-medium">Farmers</p>
            <p class="text-4xl font-bold">{{ activeUsers }}</p>
          </div>

          <!-- Buyers -->
          <div
            class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-blue-600"
          >
            <p class="text-lg font-medium">Buyers</p>
            <p class="text-4xl font-bold">{{ buyers }}</p>
          </div>

          <!-- Suspended Users -->
          <div
            class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-yellow-600"
          >
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
            <!-- Icon -->
            <Icon
              name="ph:plus-bold"
              size="18"
              class="text-green-600 group-hover:text-white"
            />
            <!-- Text -->
            <span class="group-hover:text-white">Add User</span>
          </button>
        </div>

        <!-- User Table -->
        <div
          class="overflow-x-auto bg-white border border-gray-300 rounded-md shadow-sm"
        >
          <table class="w-full table-auto">
            <thead class="bg-gray-100">
              <tr>
                <th class="py-3 px-4 text-left font-semibold text-gray-700">
                  Name
                </th>
                <th class="py-3 px-4 text-left font-semibold text-gray-700">
                  Contact Number
                </th>
                <th class="py-3 px-4 text-left font-semibold text-gray-700">
                  Email
                </th>
                <th class="py-3 px-4 text-left font-semibold text-gray-700">
                  Role
                </th>
                <th class="py-3 px-4 text-left font-semibold text-gray-700">
                  Status
                </th>
                <th class="py-3 px-4 text-center font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="hover:bg-gray-50"
              >
                <td class="py-4 px-4 border-b text-left truncate">
                  {{ user.name }}
                </td>
                <td class="py-4 px-4 border-b text-left truncate">
                  {{ user.contactNumber }}
                </td>
                <td class="py-4 px-4 border-b text-left truncate">
                  {{ user.email }}
                </td>
                <td class="py-4 px-4 border-b text-left">{{ user.role }}</td>
                <td class="py-4 px-4 border-b text-left">{{ user.status }}</td>
                <td class="py-4 px-4 border-b text-center">
                  <button
                    @click="viewUser(user.id)"
                    class="text-green-600 hover:underline"
                  >
                    View
                  </button>
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
      <div
        class="bg-white w-full max-w-[600px] p-6 rounded-md shadow-lg relative"
      >
        <!-- Close Button -->
        <button
          @click="closeRegisterModal"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <!-- Registration Form -->
        <div>
          <div class="text-center my-6 text-2xl font-bold">Register</div>

          <form @submit.prevent="register" class="space-y-4">
            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700"
                >Email</label
              >
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
              <label
                for="password"
                class="block text-sm font-medium text-gray-700"
                >Password</label
              >
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
              <label for="name" class="block text-sm font-medium text-gray-700"
                >Name</label
              >
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
              <label
                for="contact"
                class="block text-sm font-medium text-gray-700"
                >Contact Number</label
              >
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
              <label for="role" class="block text-sm font-medium text-gray-700"
                >Role</label
              >
              <select
                id="role"
                v-model="role"
                class="mt-1 w-full p-3 border border-gray-300 rounded-md"
                required
              >
                <option value="" disabled>Select role</option>
                <option value="Farmer">Farmer</option>
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
import { ref, computed } from "vue";
import AdminLayout from "~/layouts/AdminLayout.vue";
import SideBarLayout from "~/layouts/SideBarLayout.vue";
import { useUserStore } from "~/stores/user";
const userStore = useUserStore();
const user = useSupabaseUser();
const route = useRoute();
await userStore.isAdmin();

watchEffect(() => {
  if (
    route.fullPath == "/admin/users" &&
    (!user.value || userStore.isAdmin === false)
  ) {
    navigateTo("/login");
  }
});

// Modal Visibility
const isRegisterModalVisible = ref(false);

// State
const email = ref("");
const password = ref("");
const name = ref("");
const contact = ref("");
const role = ref("");

// Dummy User Data
const users = ref([
  {
    id: 1,
    name: "John Doe",
    contactNumber: "123-456-7890",
    email: "john@example.com",
    role: "Admin",
  },
]);

const totalUsers = computed(() => users.value.length);
const activeUsers = computed(
  () => users.value.filter((user) => user.role === "Farmer").length
);
const buyers = computed(
  () => users.value.filter((user) => user.role === "Buyer").length
);
const suspendedUsers = computed(
  () => users.value.filter((user) => user.status === "Suspended").length
);

// Methods
const openRegisterModal = () => {
  isRegisterModalVisible.value = true;
};

const closeRegisterModal = () => {
  isRegisterModalVisible.value = false;
};

const register = () => {
  if (
    !email.value ||
    !password.value ||
    !name.value ||
    !contact.value ||
    !role.value
  ) {
    alert("All fields are required.");
    return;
  }
  console.log("User registered:", {
    email: email.value,
    name: name.value,
    role: role.value,
  });
  closeRegisterModal();
};
</script>

<style scoped>
.main-content {
  padding-top: 100px;
}

button:hover .group-hover\:text-white {
  color: white;
}
</style>
