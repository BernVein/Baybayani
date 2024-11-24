<template>
  <div class="flex h-screen">
    <!-- Sidebar Layout -->
    <SideBarLayout class="sidebar" />

    <!-- Admin Layout -->
    <AdminLayout class="admin-layout">
      <div class="main-content flex-1 overflow-y-auto p-6">
        <!-- Title -->
        <h1 class="text-3xl font-semibold mb-8 text-center">Product Management</h1>

        <!-- Product Stats Boxes -->
        <div class="grid grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-red-600">
            <p class="text-lg font-medium">Total Products</p>
            <p class="text-4xl font-bold">{{ totalProducts }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-green-600">
            <p class="text-lg font-medium">Displayed</p>
            <p class="text-4xl font-bold">{{ displayedProducts }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-blue-600">
            <p class="text-lg font-medium">Hidden</p>
            <p class="text-4xl font-bold">{{ hiddenProducts }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow text-center border-t-4 border-yellow-600">
            <p class="text-lg font-medium">Available Products</p>
            <p class="text-4xl font-bold">{{ availableProducts }}</p>
          </div>
        </div>

        <!-- Search and Add Product -->
        <div class="flex justify-between items-center mb-4">
          <!-- Search Bar -->
          <div class="relative w-[400px]">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search product here..."
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <Icon
              name="ph:magnifying-glass"
              size="24"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          <!-- Add Product Button -->
          <button
            @click="openModal"
            class="px-6 py-3 bg-white border border-green-600 text-green-600 rounded-md hover:bg-green-600 hover:text-white flex items-center space-x-2"
          >
            <Icon
              name="ph:plus-bold"
              size="20"
              class="text-green-600 group-hover:text-white"
            />
            <span class="group-hover:text-white">Add new</span>
          </button>
        </div>

        <!-- Products Table -->
        <div class="overflow-x-auto bg-white border border-gray-300 rounded-md shadow-sm">
          <table class="w-full table-auto">
            <thead class="bg-gray-100">
              <tr>
                <th class="py-3 px-4 text-left font-semibold text-gray-700">Product ID.</th>
                <th class="py-3 px-4 text-left font-semibold text-gray-700">Product</th>
                <th class="py-3 px-4 text-left font-semibold text-gray-700">Price per kg</th>
                <th class="py-3 px-4 text-center font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="product in filteredProducts"
                :key="product.id"
                class="hover:bg-gray-50"
              >
                <td class="py-4 px-4 border-b">{{ product.id }}</td>
                <td class="py-4 px-4 border-b flex items-center space-x-3">
                  <img
                    :src="product.url"
                    alt="product image"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                  <span>{{ product.title }}</span>
                </td>
                <td class="py-4 px-4 border-b">₱{{ parseFloat(product.price).toFixed(2) }}</td>
                <td class="py-4 px-4 border-b text-center flex items-center justify-center space-x-4">
                  <button 
                    @click="toggleProductVisibility(product)" 
                    :disabled="isProductInOrderItem(product.id)" 
                    class="text-gray-600 hover:text-blue-600 disabled:opacity-50"
                  >
                    <Icon :name="product.hidden ? 'ph:eye-slash-bold' : 'ph:eye-bold'" size="20" />
                  </button>
                  <button 
                    @click="openEditModal(product)" 
                    class="text-gray-600 hover:text-gray-800"
                  >
                    <Icon name="ph:pencil-simple-bold" size="20" />
                  </button>
                  <button 
                    @click="markProductAsDeleted(product.id)" 
                    :disabled="isProductInOrderItem(product.id)" 
                    class="text-gray-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <Icon name="ph:trash-bold" size="20" />
                  </button>
                  <span v-if="isProductInOrderItem(product.id)" class="text-red-600 text-sm">Cannot delete, product exists in cart items.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>

    <!-- Add/Edit Product Modal -->
    <div
      v-if="isModalVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white w-full max-w-[600px] p-6 rounded-md shadow-lg">
        <!-- Modal Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">{{ editMode ? 'Edit Product' : 'Add Product' }}</h2>
          <button
            @click="closeModal"
            class="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <!-- Modal Content -->
        <form @submit.prevent="editMode ? updateProduct() : addProduct()">
          <div class="space-y-4">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
              <input
                id="title"
                type="text"
                v-model="product.title"
                class="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter product title"
                required
              />
            </div>
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                v-model="product.description"
                class="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter product description"
                required
              ></textarea>
            </div>
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700">Price (PHP)</label>
              <input
                id="price"
                type="number"
                v-model="product.price"
                class="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter product price (e.g., 100)"
                required
              />
            </div>
            <div>
              <label for="url" class="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                id="url"
                type="text"
                v-model="product.url"
                class="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="Enter image URL"
                required
              />
            </div>
            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {{ editMode ? 'Update Product' : 'Add Product' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Success or Error Notification -->
    <transition name="fade">
      <div v-if="notification.show" :class="['fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-md shadow-lg', notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white']">
        {{ notification.message }}
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, computed, onMounted } from "vue";
import AdminLayout from "~/layouts/AdminLayout.vue";
import SideBarLayout from "~/layouts/SideBarLayout.vue";
import { useRuntimeConfig } from '#imports';

export default {
  name: "ProductManagement",
  components: {
    AdminLayout,
    SideBarLayout,
  },
  setup() {
    const config = useRuntimeConfig();
    const apiUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : config.public.apiUrl;

    const isModalVisible = ref(false);
    const editMode = ref(false);
    const products = ref([]);
    const notification = ref({ show: false, message: '', type: 'success' });
    const product = ref({
      id: null,
      title: "",
      description: "",
      price: null,
      url: "",
      hidden: false,
    });
    const orderItems = ref([]);

    const openModal = () => {
      editMode.value = false;
      isModalVisible.value = true;
    };

    const openEditModal = (productToEdit) => {
      editMode.value = true;
      product.value = { ...productToEdit };
      isModalVisible.value = true;
    };

    const closeModal = () => {
      isModalVisible.value = false;
      product.value = { id: null, title: "", description: "", price: null, url: "", hidden: false };
    };

    const showNotification = (message, type = 'success') => {
      notification.value = { show: true, message, type };
      setTimeout(() => {
        notification.value.show = false;
      }, 3000);
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/prisma/get-all-products`);
        if (response.status === 200) {
          products.value = response.data.filter(product => !product.isDeleted);
        } else {
          throw new Error("Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    const fetchOrderItems = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/prisma/get-order-items`);
        if (response.status === 200) {
          orderItems.value = response.data;
          console.log("Order Items:", orderItems.value); // Print the order items in the console
        } else {
          throw new Error("Failed to fetch order items");
        }
      } catch (err) {
        console.error("Error fetching order items:", err);
      }
    };

    const isProductInOrderItem = (productId) => {
      return orderItems.value.some(orderItem => orderItem.productId === productId);
    };

    const addProduct = async () => {
      try {
        const response = await axios.post(`${apiUrl}/api/prisma/add-product`, {
          title: product.value.title,
          description: product.value.description,
          url: product.value.url,
          price: parseInt(product.value.price, 10),
          hidden: false,
        });

        if (response.status === 201 && response.data.body.message === "Product added successfully!") {
          showNotification("Product successfully added!", 'success');
          products.value.push(response.data.body.product);
          closeModal();
        } else {
          console.error(`Error adding product: ${response.data.body.message || "Unexpected error"}`);
          showNotification(`Error adding product: ${response.data.body.message || "Unexpected error"}`, 'error');
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        showNotification("Unexpected error: " + err.message, 'error');
      }
    };

    const updateProduct = async () => {
      try {
        const response = await axios.put(`${apiUrl}/api/prisma/update-product/${product.value.id}`, {
          title: product.value.title,
          description: product.value.description,
          url: product.value.url,
          price: parseInt(product.value.price, 10),
          hidden: product.value.hidden,
        });

        if (response.status === 200) {
          showNotification("Product successfully updated!", 'success');
          const index = products.value.findIndex((p) => p.id === product.value.id);
          if (index !== -1) {
            products.value[index] = { ...product.value };
          }
          closeModal();
        } else {
          throw new Error("Failed to update product");
        }
      } catch (err) {
        console.error("Error updating product:", err);
        showNotification("Error updating product: " + err.message, 'error');
      }
    };

    const toggleProductVisibility = async (product) => {
      if (isProductInOrderItem(product.id)) {
        showNotification("Cannot change visibility of a product that is part of an order.", 'error');
        return;
      }

      try {
        const updatedProduct = { ...product, hidden: !product.hidden };
        const response = await axios.put(`${apiUrl}/api/prisma/update-product/${product.id}`, {
          hidden: updatedProduct.hidden,
        });

        if (response.status === 200) {
          product.hidden = updatedProduct.hidden;
          showNotification("Product visibility updated!", 'success');
        } else {
          throw new Error("Failed to update product visibility");
        }
      } catch (err) {
        if (err.response && err.response.status === 400) {
          showNotification("Cannot update product. It is part of an order.", 'error');
        } else {
          console.error("Error updating product visibility:", err);
          showNotification("Error updating product visibility: " + err.message, 'error');
        }
      }
    };

    const markProductAsDeleted = async (productId) => {
      if (isProductInOrderItem(productId)) {
        showNotification("Cannot delete a product that is part of an order.", 'error');
        return;
      }

      try {
        const response = await axios.put(`${apiUrl}/api/prisma/update-product/${productId}`, {
          isDeleted: true,
        });

        if (response.status === 200) {
          showNotification("Product successfully marked as deleted!", 'success');
          products.value = products.value.filter((p) => p.id !== productId);
        } else {
          throw new Error("Failed to delete product");
        }
      } catch (err) {
        if (err.response && err.response.status === 400) {
          showNotification("Cannot delete product. It is part of a cart.", 'error');
        } else {
          console.error("Error deleting product:", err);
          showNotification("Error deleting product: " + err.message, 'error');
        }
      }
    };

    const searchQuery = ref("");
    const filteredProducts = computed(() =>
      products.value.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );

    const totalProducts = computed(() => products.value.length);
    const displayedProducts = computed(() => products.value.filter((p) => !p.hidden).length);
    const hiddenProducts = computed(() => products.value.filter((p) => p.hidden).length);
    const availableProducts = computed(() => products.value.filter((p) => !p.hidden).length);

    onMounted(() => {
      fetchProducts();
      fetchOrderItems();
    });

    return {
      isModalVisible,
      editMode,
      products,
      product,
      notification,
      openModal,
      openEditModal,
      closeModal,
      addProduct,
      updateProduct,
      toggleProductVisibility,
      markProductAsDeleted,
      searchQuery,
      filteredProducts,
      totalProducts,
      displayedProducts,
      hiddenProducts,
      availableProducts,
      isProductInOrderItem,
    };
  },
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.main-content {
  padding-top: 100px;
}

button:hover .group-hover\:text-white {
  color: white;
}

.fixed-notification {
  position: fixed;
  top: 4rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
}
</style>
