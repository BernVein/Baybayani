<template>
  <LayoutAdmin>
    <div class="flex items-center justify-center w-full h-screen">
      <div class="w-full h-[100vh] max-w-[1200px] bg-[#fafafa] p-6 rounded-lg">
        <!-- Title -->
        <h1 class="text-2xl font-semibold text-start mb-6">Add Farmer</h1>

        <!-- Farmer Form -->
        <form @submit.prevent="submitForm">
          <div class="space-y-4">
            <!-- Farmer Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">
                Farmer Name
              </label>
              <input v-model="farmer.name" id="name" type="text" required
                class="w-full mt-2 p-3 border border-gray-300 rounded-md" placeholder="Enter farmer name" />
            </div>

            <!-- Farmer Contact Number -->
            <div>
              <label for="contact" class="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input v-model="farmer.contact" id="contact" type="tel" required
                class="w-full mt-2 p-3 border border-gray-300 rounded-md" placeholder="Enter contact number" />
            </div>

            <!-- Searchable and Collapsible Products List -->
            <div>
              <label for="products" class="block text-sm font-medium text-gray-700">
                Products Supplied by Farmer
              </label>

              <!-- Search Input -->
              <input v-model="searchQuery" type="text" class="w-full mt-2 p-3 border border-gray-300 rounded-md"
                placeholder="Search products..." />

              <!-- Toggle Button -->
              <button type="button" @click="toggleCollapse" class="mt-2 text-blue-600 hover:text-blue-700">
                {{ collapsed ? "Show Products" : "Hide Products" }}
              </button>

              <!-- Products List (Checkboxes) -->
              <div v-if="!collapsed" class="mt-4 max-h-60 overflow-y-auto">
                <div v-for="product in filteredProducts" :key="product.id" class="flex items-center mb-2">
                  <input type="checkbox" :id="'product-' + product.id" :value="product.id" v-model="selectedProducts"
                    class="mr-2" />
                  <label :for="'product-' + product.id" class="text-sm">
                    {{ product.title }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Error and Success Messages -->
            <div v-if="successMessage" class="text-green-600 mt-4">
              {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="text-red-600 mt-4">
              {{ errorMessage }}
            </div>

            <!-- Submit Button -->
            <div class="mt-6 text-right">
              <button type="submit" class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                Add Farmer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </LayoutAdmin>
</template>

<script setup>
import { ref, onBeforeMount, computed } from "vue";
import LayoutAdmin from "~/layouts/LayoutAdmin.vue";

import { useUserStore } from "~/stores/user";
const userStore = useUserStore();
const user = useSupabaseUser();
const route = useRoute();

await userStore.isAdmin();

watchEffect(() => {
  if (
    route.fullPath == "/admin/addfarmer" &&
    (!user.value || !userStore.isAdmin)
  ) {
    navigateTo("/login");
  }
});

// Reactive variables for the farmer's form data
const farmer = ref({
  name: "",
  contact: "",
});

// List of selected product IDs
const selectedProducts = ref([]);
const products = ref([]);
const searchQuery = ref("");
const collapsed = ref(true); // Track whether the product list is collapsed
const successMessage = ref("");
const errorMessage = ref("");

// Fetch products from the API when the component is mounted
onBeforeMount(async () => {
  try {
    const response = await fetch("/api/prisma/get-all-products");
    const result = await response.json();

    if (response.ok) {
      products.value = result; // Populate products list
    } else {
      throw new Error("Failed to fetch products");
    }
  } catch (error) {
    errorMessage.value = "Error fetching products: " + error.message;
  }
});

// Computed property to filter products based on the search query
const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  return products.value.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Toggle collapse state for the product list
const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
};

// Form submission logic
const submitForm = async () => {
  const newFarmer = {
    name: farmer.value.name,
    contact: farmer.value.contact,
    productIds: selectedProducts.value, // Array of selected product IDs
  };

  try {
    const response = await fetch("/api/prisma/add-farmer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newFarmer),
    });

    const result = await response.json();

    if (response.ok) {
      successMessage.value = "Farmer created successfully!";
      errorMessage.value = "";

      // Collapse the product list after successful submission
      collapsed.value = true; // Collapsing the list

      // Reset the form after success
      farmer.value = { name: "", contact: "" };
      selectedProducts.value = [];
    } else {
      throw new Error(result.error || "Failed to create farmer");
    }
  } catch (error) {
    errorMessage.value = "Error: " + error.message;
    successMessage.value = "";
  }
};
</script>
