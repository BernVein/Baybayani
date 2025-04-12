<template>
  <div class="flex h-screen">
    <!-- Sidebar Layout -->
    <SideBarLayout class="sidebar" />

    <!-- Admin Layout -->
    <LayoutAdmin class="admin-layout">
      <div class="main-content flex-1 overflow-y-auto p-6">
        <!-- Title -->
        <h1 class="text-3xl font-semibold mb-8 text-center">
          Product Management
        </h1>

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
            <input v-model="searchQuery" type="text" placeholder="Search product here..."
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600" />
            <Icon name="ph:magnifying-glass" size="24"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <!-- Add Product Button -->
          <button @click="openModal"
            class="px-6 py-3 bg-white border border-green-600 text-green-600 rounded-md hover:bg-green-600 hover:text-white flex items-center space-x-2">
            <Icon name="ph:plus-bold" size="20" class="text-green-600 group-hover:text-white" />
            <span class="group-hover:text-white">Add new</span>
          </button>
        </div>

        <!-- Products Table -->
        <div class="overflow-x-auto bg-white border border-gray-300 rounded-md shadow-sm">
          <table class="w-full table-auto">
            <thead class="bg-gray-100">
              <tr>
                <th class="py-3 px-4 text-left font-semibold text-gray-700">
                  Product ID.
                </th>
                <th class="py-3 px-4 text-left font-semibold text-gray-700">
                  Product
                </th>
                <th class="py-3 px-4 text-left font-semibold text-gray-700">
                  Price per kg
                </th>
                <th class="py-3 px-4 text-left font-semibold text-gray-700">Stock</th>

                <th class="py-3 px-4 text-center font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <!-- table content -->
            <tbody>
              <tr v-for="product in paginatedProducts" :key="product.id"
                class="hover:bg-gray-200 transition duration-150 ease-in-out product-row">
                <td class="py-4 px-4 cursor-pointer" @click="showProductDetails(product)">
                  <span v-html="highlightMatch(formatNumber(product.id))"></span>
                </td>
                <td class="py-4 px-4 flex items-center space-x-3 cursor-pointer" @click="showProductDetails(product)">
                  <img :src="product.url" alt="product image" class="w-10 h-10 rounded-full object-cover" />
                  <span v-html="highlightMatch(product.title)"></span>
                </td>
                <td class="py-4 px-4 cursor-pointer" @click="showProductDetails(product)">
                  ₱{{ formatNumber(parseFloat(product.price).toFixed(2)) }}
                </td>


                <td class="py-4 px-4 cursor-pointer" @click="showProductDetails(product)">
                  <span :class="{
                    'text-green-600 font-medium': product.stock > 10,
                    'text-orange-500 font-medium': product.stock > 0 && product.stock <= 20,
                    'text-red-600 font-medium': product.stock <= 0
                  }">
                    {{ product.stock }}
                    <span v-if="product.stock <= 0" class="text-xs text-red-600 block">
                      (Out of stock)
                    </span>
                    <span v-else-if="product.stock <= 20" class="text-xs text-orange-500 block">
                      (Low stock)
                    </span>
                  </span>
                </td>


                <td class="py-4 px-4 text-center flex items-center justify-center space-x-4">
                  <button @click.stop="toggleProductVisibility(product)" :disabled="isProductInOrderItem(product.id)"
                    class="text-gray-600 hover:text-blue-600 disabled:opacity-50">
                    <Icon :name="product.hidden ? 'ph:eye-slash-bold' : 'ph:eye-bold'" size="20" />
                  </button>

                  <button @click.stop="openAddStockModal(product)" class="text-gray-600 hover:text-green-600"
                    title="Add Stock">
                    <Icon name="ph:plus-circle-bold" size="20" />
                  </button>

                  <button @click.stop="openEditModal(product)" class="text-gray-600 hover:text-gray-800">
                    <Icon name="ph:pencil-simple-bold" size="20" />
                  </button>

                  <button @click.stop="markProductAsDeleted(product.id)" :disabled="isProductInOrderItem(product.id)"
                    class="text-gray-600 hover:text-red-800 disabled:opacity-50">
                    <Icon name="ph:trash-bold" size="20" />
                  </button>

                  <span v-if="isProductInOrderItem(product.id)" class="text-red-600 text-sm">
                    Cannot delete, product exists in cart items.
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination Controls -->
          <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
            <!-- Items per page selector -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-700">Show</span>
              <select v-model="itemsPerPage" class="border rounded px-2 py-1 text-sm" @change="currentPage = 1">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span class="text-sm text-gray-700">entries</span>
            </div>

            <!-- Page information -->
            <div class="text-sm text-gray-700">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalItems }} entries
            </div>

            <!-- Pagination buttons -->
            <div class="flex gap-2">
              <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-button"
                :class="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
                Previous
              </button>

              <button v-for="page in displayedPages" :key="page"
                @click="typeof page === 'number' ? currentPage = page : null" class="pagination-button" :class="[
                  typeof page === 'number' ? (currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100') : '',
                  typeof page === 'string' ? 'cursor-default' : ''
                ]">
                {{ page }}
              </button>

              <button @click="currentPage++" :disabled="currentPage === totalPages" class="pagination-button"
                :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>

    <!-- Add/Edit Product Modal -->
    <div v-if="isModalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-[600px] p-6 rounded-md shadow-lg">
        <!-- Modal Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">
            {{ editMode ? "Edit Product" : "Add Product" }}
          </h2>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>

        <!-- Modal Content -->
        <form @submit.prevent="editMode ? updateProduct() : addProduct()">
          <div class="space-y-4">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
              <input id="title" type="text" v-model="product.title"
                class="w-full mt-1 p-2 border border-gray-300 rounded-md" placeholder="Enter product title" required />
            </div>
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" v-model="product.description"
                class="w-full mt-1 p-2 border border-gray-300 rounded-md" placeholder="Enter product description"
                required></textarea>
            </div>
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700">Price (PHP)</label>
              <input id="price" type="number" v-model="product.price"
                class="w-full mt-1 p-2 border border-gray-300 rounded-md" placeholder="Enter product price (e.g., 100)"
                required />
            </div>

            <!-- Stock field (only shown when adding new product) -->
            <div v-if="!editMode">
              <label for="stock" class="block text-sm font-medium text-gray-700">Stock Quantity</label>
              <input id="stock" type="number" v-model="product.stock" min="0"
                class="w-full mt-1 p-2 border border-gray-300 rounded-md" placeholder="Enter stock quantity" required />
            </div>

            <!-- Image Upload -->
            <div>
              <label for="image" class="block text-sm font-medium text-gray-700">
                Product Image
              </label>
              <input type="file" id="image" @change="handleFileChange"
                class="mt-2 p-3 border border-gray-300 rounded-md" accept="image/*" />
              <div v-if="imagePreview" class="mt-4">
                <p>Image Preview:</p>
                <img :src="imagePreview" alt="Image Preview" class="w-48 h-48 object-cover mt-2" />
              </div>
            </div>

            <div class="flex justify-end space-x-4">
              <button type="button" @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-100">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                {{ editMode ? "Update Product" : "Add Product" }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Stock Modal -->
    <div v-if="isAddStockModalVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white w-full max-w-md p-6 rounded-md shadow-lg">
        <!-- Modal Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">
            Adjust Stock for {{ selectedProduct?.title }}
          </h2>
          <button @click="closeAddStockModal" class="text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>

        <!-- Modal Content -->
        <form @submit.prevent="updateStock">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Current Stock</label>
              <input type="number" :value="selectedProduct?.stock"
                class="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100" disabled />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Adjust Stock</label>
              <div class="flex items-center">
                <button type="button" @click="adjustStock(-1)"
                  class="p-2 border border-gray-300 rounded-l-md bg-gray-100 hover:bg-gray-200">
                  <Icon name="ph:minus-bold" size="16" />
                </button>

                <input type="number" v-model.number="stockAdjustment" min="-1000" max="1000" step="1"
                  class="flex-1 p-2 border-t border-b border-gray-300 text-center" @input="validateStockAdjustment" />

                <button type="button" @click="adjustStock(1)"
                  class="p-2 border border-gray-300 rounded-r-md bg-gray-100 hover:bg-gray-200">
                  <Icon name="ph:plus-bold" size="16" />
                </button>
              </div>

              <p class="mt-2 text-sm" :class="{
                'text-green-600': stockAdjustment > 0,
                'text-red-600': stockAdjustment < 0,
                'text-gray-500': stockAdjustment === 0
              }">
                New stock will be: {{ (selectedProduct?.stock || 0) + stockAdjustment }}
              </p>
            </div>

            <div class="flex justify-end space-x-4">
              <button type="button" @click="closeAddStockModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-100">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Update Stock
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    <!-- Success or Error Notification -->
    <transition name="fade">
      <div v-if="notification.show" :class="[
        'fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-md shadow-lg',
        notification.type === 'success'
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white',
      ]">
        {{ notification.message }}
      </div>
    </transition>

    <!-- View Product Details Modal -->
    <div v-if="isViewModalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative">
        <!-- Close button -->
        <button @click="closeViewModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <Icon name="ph:x-bold" size="24" />
        </button>

        <!-- Modal content -->
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-center">Product Details</h2>

          <!-- Product image -->
          <div class="flex justify-center">
            <img :src="selectedProduct?.url" :alt="selectedProduct?.title"
              class="w-48 h-48 object-cover rounded-lg shadow-lg" />
          </div>

          <!-- Product details -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-gray-600">Product ID</p>
              <p class="font-semibold">{{ selectedProduct?.id }}</p>
            </div>
            <div>
              <p class="text-gray-600">Product Name</p>
              <p class="font-semibold">{{ selectedProduct?.title }}</p>
            </div>
            <div>
              <p class="text-gray-600">Price per kg</p>
              <p class="font-semibold">₱{{ parseFloat(selectedProduct?.price).toFixed(2) }}</p>
            </div>
            <div>
              <p class="text-gray-600">Status</p>
              <p class="font-semibold">
                <span class="px-2 py-1 rounded-full text-sm"
                  :class="selectedProduct?.hidden ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
                  {{ selectedProduct?.hidden ? 'Unavailable' : 'Available' }}
                </span>
              </p>
            </div>
            <div class="col-span-2">
              <p class="text-gray-600">Description</p>
              <p class="font-semibold">{{ selectedProduct?.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Component -->
    <Loading v-if="isLoading" />

    <!-- Add Toast Container -->
    <div class="fixed top-4 right-4 z-50">
      <div v-for="toast in toasts" :key="toast.id"
        class="mb-2 p-4 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in" :class="{
          'bg-green-500 text-white': toast.type === 'success',
          'bg-red-500 text-white': toast.type === 'error'
        }">
        {{ toast.message }}
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="isDeleteModalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative animate-fade-in">
        <div class="text-center space-y-4">
          <Icon name="ph:warning-circle-bold" class="text-red-500 mx-auto" size="64" />

          <h2 class="text-2xl font-bold text-gray-900">Delete Product</h2>

          <p class="text-gray-600">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>

          <div class="flex justify-center gap-4 mt-6">
            <button @click="closeDeleteModal"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button @click="confirmDelete"
              class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2">
              <Icon name="ph:trash-bold" size="20" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, computed, onMounted, watch } from "vue";
import LayoutAdmin from "~/layouts/LayoutAdmin.vue";
import SideBarLayout from "~/layouts/SideBarLayout.vue";
import { useUserStore } from "~/stores/user";
import { useRuntimeConfig } from "#imports";
import Loading from '~/components/Loading.vue';
import Compressor from "compressorjs";
const supabase = useSupabaseClient();

const imagePreview = ref(null); // For image preview


const compressedImage = ref(null); // For the compressed image file
const userStore = useUserStore();

const user = useSupabaseUser();
const route = useRoute();


const role = userStore.profile?.role;
watchEffect(() => {
  if (
    route.fullPath == "/admin/products" &&
    (!user.value || role === "User")
  ) {
    navigateTo("/login");
  }
});

function getPublicUrl(bucketName, filePath) {
  const supabaseUrl = "https://ucijbmsogggpigwppfpu.supabase.co"; // Replace with your Supabase project URL
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
}

// Handle file change and compress the image
const handleFileChange = (event) => {
  // console.log("Handle File Change Running");
  const file = event.target.files[0];
  if (!file) return;

  // Compress the image using Compressor.js
  new Compressor(file, {
    quality: 0.6, // Set image quality (60%)
    maxWidth: 800, // Resize image to max width 800px (aspect ratio maintained)
    maxHeight: 800, // Resize image to max height 800px (aspect ratio maintained)
    success(result) {
      // Create a new image element to load the compressed image
      const img = new Image();
      img.onload = () => {
        // Create a canvas to crop and resize the image to 800x800
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set the canvas size to 800x800
        canvas.width = 800;
        canvas.height = 800;

        // Calculate the center crop coordinates
        const x = (img.width - 800) / 2; // Crop from the center horizontally
        const y = (img.height - 800) / 2; // Crop from the center vertically

        // Draw the image on the canvas (crop and fit to 800x800)
        ctx.drawImage(img, x, y, 800, 800, 0, 0, 800, 800);

        // Convert the canvas to Blob for uploading
        canvas.toBlob(
          (blob) => {
            // Use the Blob to create a preview URL
            compressedImage.value = blob;
            imagePreview.value = URL.createObjectURL(blob); // Display preview of the resized image
          },
          "image/jpeg",
          0.8
        );
      };
      img.src = URL.createObjectURL(result); // Load the compressed image into the img element
      //  console.log(result);
      // console.log("COPRESSION SUCCESS");
    },
    error(err) {
      console.error("Image compression failed", err);
    },
  });
};

const addProduct = async () => {
  //  console.log("ADD product running");
  isLoading.value = false;
  if (!compressedImage.value) {
    alert("Please upload a valid image.");
    return;
  }

  const fileName = `products/images/${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;

  // console.log(fileName);

  const { data, error } = await supabase.storage
    .from("product-images") // Replace with your Supabase bucket name 
    .upload(fileName, compressedImage.value);

  //console.log("Upload response:", data); // Log upload response

  if (error) {
    console.error("Image upload failed", error);
    return;
  }

  // Construct the public URL for the uploaded image
  const imageUrl = getPublicUrl("product-images", data.path); // Use the path from the upload response

  // console.log("Uploaded Image URL:", imageUrl); // This is where you check the URL

  try {
    // Send as JSON object instead of FormData
    const response = await $fetch("/api/prisma/add-product", {
      method: "POST",
      body: {
        title: product.value.title,
        description: product.value.description,
        price: parseInt(product.value.price),
        stock: parseInt(product.value.stock) || 0,
        url: imageUrl, // Save image URL
      },
    });

    // Check for response structure
    if (response.body?.product) {
      await fetchProducts();

      showToast("Product added successfully! 🎉", "success");
      closeModal();

      // Reset form after submission
      product.value = {
        title: "",
        description: "",
        price: 0,
        imageUrl: "",
      };
      imagePreview.value = null;
    } else {
      throw new Error("Failed to add product");
    }
  } catch (error) {
    console.error("Error adding product:", error);
    showToast("Failed to add product........... Please try again.", "error");
  } finally {
    isLoading.value = false;
  }
};


const config = useRuntimeConfig();
const apiUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : config.public.apiUrl;

const isModalVisible = ref(false);
const editMode = ref(false);
const products = ref([]);
const notification = ref({ show: false, message: "", type: "success" });
const product = ref({
  id: null,
  title: "",
  description: "",
  stock: 0,
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
  product.value = {
    id: null,
    title: "",
    description: "",
    price: null,
    url: "",
    hidden: false,
  };
};

const showNotification = (message, type = "success") => {
  notification.value = { show: true, message, type };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

const fetchProducts = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`${apiUrl}/api/prisma/get-all-products`);
    if (response.status === 200) {
      // Filter out deleted products
      products.value = response.data.filter(product => !product.isDeleted);
    } else {
      throw new Error("Failed to fetch products");
    }
  } catch (err) {
    console.error("Error fetching products:", err);
    showToast("Failed to fetch products. Please try again.", "error");
  } finally {
    isLoading.value = false;
  }
};

const fetchOrderItems = async () => {
  try {
    const response = await axios.get(
      `${apiUrl}/api/prisma/get-order-items`
    );
    if (response.status === 200) {
      orderItems.value = response.data;
      //console.log("Order Items:", orderItems.value); // Print the order items in the console
    } else {
      throw new Error("Failed to fetch order items");
    }
  } catch (err) {
    console.error("Error fetching order items:", err);
  }
};

const isProductInOrderItem = (productId) => {
  return orderItems.value.some(
    (orderItem) => orderItem.productId === productId
  );
};

const updateProduct = async () => {
  let imageUrl = product.value.url;

  try {
    isLoading.value = true;

    if (compressedImage.value) {
      const fileName = `products/images/${Date.now()}_${Math.random().toString(36).substring(2, 15)}.jpg`;
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, compressedImage.value);

      if (error) {
        console.error("Image upload failed (update)", error);
        return;
      }
      imageUrl = getPublicUrl("product-images", data.path);
    }

    const response = await $fetch(`/api/prisma/update-product/${product.value.id}`, {
      method: "PUT",
      body: {
        title: product.value.title,
        description: product.value.description,
        price: parseInt(product.value.price),
        stock: parseInt(product.value.stock) || 0,  // Add this line
        url: imageUrl,
      },
    });

    if (response.body?.product) {
      await fetchProducts();
      closeModal();
      showToast("Product updated successfully! ✨", "success");
      product.value = {
        title: product.value.title,
        description: product.value.description,
        price: product.value.price,
        stock: product.value.stock,  // Add this line
        url: imageUrl,
        image: null,
      };
      imagePreview.value = imageUrl;
    } else {
      throw new Error("Failed to update product");
    }
  } catch (error) {
    console.error("Error updating product:", error);
    showToast("Failed to update product. Please try again.", "error");
  } finally {
    isLoading.value = false;
  }
};


const toggleProductVisibility = async (product) => {
  if (isProductInOrderItem(product.id)) {
    showToast("Cannot modify product that exists in cart items.", "error");
    return;
  }

  isLoading.value = true;
  try {
    const response = await $fetch(`/api/prisma/update-product/${product.id}`, {
      method: "PUT",
      body: { hidden: !product.hidden },
    });

    if (response) {
      await fetchProducts();
      showToast(
        `Product is now ${!product.hidden ? 'hidden' : 'visible'} 👁️`,
        "success"
      );
    }
  } catch (error) {
    console.error("Error toggling product visibility:", error);
    showToast("Failed to update product visibility. Please try again.", "error");
  } finally {
    isLoading.value = false;
  }
};

const markProductAsDeleted = (productId) => {
  if (isProductInOrderItem(productId)) {
    showToast("Cannot delete product that exists in cart items.", "error");
    return;
  }

  productToDelete.value = productId;
  isDeleteModalVisible.value = true;
};

const searchQuery = ref("");
const filteredProducts = computed(() =>
  products.value.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

const totalProducts = computed(() => products.value.length);
const displayedProducts = computed(
  () => products.value.filter((p) => !p.hidden).length
);
const hiddenProducts = computed(
  () => products.value.filter((p) => p.hidden).length
);
const availableProducts = computed(
  () => products.value.filter((p) => !p.hidden).length
);

// Add these refs for pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Add these computed properties for pagination
const totalItems = computed(() => filteredProducts.value.length);

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);

const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value));

const paginatedProducts = computed(() => {
  return filteredProducts.value.slice(startIndex.value, endIndex.value);
});

// Add this for page number display
const displayedPages = computed(() => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages.value; i++) {
    if (
      i === 1 ||
      i === totalPages.value ||
      (i >= currentPage.value - delta && i <= currentPage.value + delta)
    ) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});

// Add highlight function (after searchQuery ref)
const highlightMatch = (text) => {
  if (!searchQuery.value) return text;
  return text.toString().replace(
    new RegExp(`(${searchQuery.value})`, 'gi'),
    '<span class="bg-yellow-200">$1</span>'
  );
};

// Remove the animation watch section (around line 659-671)
watch(searchQuery, () => {
  currentPage.value = 1;
});

onMounted(async () => {
  isLoading.value = true;
  try {
    await Promise.all([fetchProducts(), fetchOrderItems()]);
  } catch (error) {
    console.error("Error during initial data fetch:", error);
    showToast("Failed to load initial data. Please refresh the page.", "error");
  } finally {
    isLoading.value = false;
  }
});

const isViewModalVisible = ref(false);
const isAddStockModalVisible = ref(false);
const selectedProduct = ref(null);
const stockAdjustment = ref(0);


const openAddStockModal = (product) => {
  selectedProduct.value = product;
  stockAdjustment.value = 0;
  isAddStockModalVisible.value = true;
};

const closeAddStockModal = () => {
  isAddStockModalVisible.value = false;
  selectedProduct.value = null;
  stockAdjustment.value = 0;
};


const adjustStock = (amount) => {
  stockAdjustment.value += amount;
  validateStockAdjustment();
};

const updateStock = async () => {
  if (!selectedProduct.value) return;

  try {
    isLoading.value = true;

    const newStock = selectedProduct.value.stock + stockAdjustment.value;

    const response = await $fetch(`/api/prisma/update-product/${selectedProduct.value.id}`, {
      method: "PUT",
      body: {
        stock: newStock
      }
    });

    if (response) {
      await fetchProducts();

      showToast(
        stockAdjustment.value >= 0
          ? `Added ${stockAdjustment.value} to stock successfully!`
          : `Removed ${Math.abs(stockAdjustment.value)} from stock successfully!`,
        "success"
      );
      closeAddStockModal();
    }
  } catch (error) {
    console.error("Error updating stock:", error);
    showToast("Failed to update stock. Please try again.", "error");
  } finally {
    isLoading.value = false;
  }
};

const validateStockAdjustment = () => {
  // Ensure stock doesn't go negative (unless you want to allow negative adjustments)
  const maxReduction = selectedProduct.value?.stock || 0;
  if (stockAdjustment.value < -maxReduction) {
    stockAdjustment.value = -maxReduction;
  }

  // Optional: Set upper limit if needed
  if (stockAdjustment.value > 1000) {
    stockAdjustment.value = 1000;
  }
};


// Add these methods
const showProductDetails = (product) => {
  selectedProduct.value = product;
  isViewModalVisible.value = true;
};

const closeViewModal = () => {
  isViewModalVisible.value = false;
  selectedProduct.value = null;
};

// Add these refs
const isLoading = ref(false);
const toasts = ref([]);

// Add toast function
const showToast = (message, type = 'success') => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 3000);
};

// Add these refs for delete modal
const isDeleteModalVisible = ref(false);
const productToDelete = ref(null);

// Add methods to handle delete modal
const closeDeleteModal = () => {
  isDeleteModalVisible.value = false;
  productToDelete.value = null;
};

const confirmDelete = async () => {
  isLoading.value = true;
  try {
    // Use update endpoint instead of delete
    const response = await $fetch(`/api/prisma/update-product/${productToDelete.value}`, {
      method: "PUT",
      body: {
        isDeleted: true,
        hidden: true // Also hide the product when it's deleted
      }
    });

    if (response) {
      await fetchProducts();
      showToast("Product deleted successfully! 🗑️", "success");
      closeDeleteModal();
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    showToast("Failed to delete product. Please try again.", "error");
  } finally {
    isLoading.value = false;
  }
};

// Function to format numbers with commas
const formatNumber = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
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

.pagination-button {
  @apply px-3 py-1 rounded border;
}

.pagination-button:disabled {
  @apply bg-gray-100 text-gray-400 cursor-not-allowed;
}

.pagination-button:not(:disabled):hover {
  @apply bg-gray-100;
}

.pagination-button.active {
  @apply bg-blue-500 text-white;
}

/* Optional: Add animation for modal */
.fixed {
  animation: fadeIn 0.2s ease-in-out;
}

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

/* Add animation for modal */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

/* Add animation for modal */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

/* Optional: Add transition for smoother animations */
tr {
  transition: all 0.3s ease-in-out;
}

/* Add zoom effect on hover */
.product-row:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease-in-out;
}
</style>
