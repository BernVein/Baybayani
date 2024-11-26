<template>
  <div class="flex h-screen">
    <!-- Sidebar Section -->
    <nav class="bg-green-700 text-white w-64 flex flex-col justify-center p-4 sticky top-0 h-screen">
      <ul class="space-y-6">
        <!-- Dashboard -->
        <li>
          <a
            href="../admin/dashboard"
            class="flex items-center space-x-4 text-md font-medium hover:text-green-700 hover:bg-yellow-500 p-3 rounded-lg transition duration-300"
          >
            <!-- Icon -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              class="w-6 h-6"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Dashboard</span>
          </a>
        </li>

      <!-- Chat -->
      <li>
        <a
          href="../admin/chat"
          class="flex items-center space-x-4 text-md font-medium hover:text-green-700 hover:bg-yellow-500 p-3 rounded-lg transition duration-300"
        >
          <!-- New Chat Icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            class="w-6 h-6"
          >
            <path d="M4 2C2.895 2 2 2.895 2 4V14C2 15.105 2.895 16 4 16H6V19.586C6 19.851 6.105 20.105 6.293 20.293C6.488 20.488 6.744 20.586 7 20.586C7.128 20.586 7.256 20.553 7.371 20.485L12.236 17H20C21.105 17 22 16.105 22 15V4C22 2.895 21.105 2 20 2H4ZM4 4H20V15H11.764L7 18.571V15H4V4Z" />
          </svg>
          <span>Chat</span>
        </a>
      </li>


      <!-- Orders -->
      <li>
        <a
          href="../admin/orders"
          class="flex items-center space-x-4 text-md font-medium hover:text-green-700 hover:bg-yellow-500 p-3 rounded-lg transition duration-300"
        >
          <!-- New Thinner Cart Icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            class="w-6 h-6"
          >
            <path d="M7 18c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm10 0c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm-11.167-4L4.98 6h14.358l-1.446 6H6.833zM6 8l1.333 6h9.334L18 8H6z" />
          </svg>
          <span>Orders</span>
        </a>
      </li>

      <!-- Product -->
      <li>
        <a
          href="../admin/products"
          class="flex items-center space-x-4 text-md font-medium hover:text-green-700 hover:bg-yellow-500 p-3 rounded-lg transition duration-300"
        >
          <!-- New Vegetable Group Icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            class="w-6 h-6"
          >
            <path d="M21 12.5c0-2.52-2.239-4.5-5-4.5-.725 0-1.424.145-2.072.412-.31-.644-.715-1.244-1.206-1.789.148-.175.288-.357.417-.548 1.002-1.487.457-3.485-1.215-3.485-.954 0-1.668.763-2.424 1.85-.86-1.134-1.755-1.865-2.781-1.865C5.57 2.075 5 3.28 5 4.425c0 1.026.606 1.972 1.414 2.59C4.876 7.734 4 9.225 4 10.75c0 2.124 2.486 3.85 5.443 3.85.453 0 .892-.055 1.312-.153.567.403 1.247.803 2.245 1.113 1.1.343 2.521.345 3.717-.255 1.18-.593 2.284-1.819 2.284-3.155zM7.5 20c-1.379 0-2.5 1.122-2.5 2.5S6.121 25 7.5 25s2.5-1.121 2.5-2.5S8.879 20 7.5 20zm7-2c-1.379 0-2.5 1.122-2.5 2.5S13.121 23 14.5 23s2.5-1.121 2.5-2.5S15.879 18 14.5 18z" />
          </svg>
          <span>Product</span>
        </a>
      </li>


        <!-- Users -->
        <li>
          <a
            href="../admin/users"
            class="flex items-center space-x-4 text-md font-medium hover:text-green-700 hover:bg-yellow-500 p-3 rounded-lg transition duration-300"
          >
            <!-- Icon -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              class="w-6 h-6"
            >
              <path d="M12 12c2.209 0 4-1.791 4-4s-1.791-4-4-4-4 1.791-4 4 1.791 4 4 4zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
            </svg>
            <span>Users</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: "SidebarLayout",
};
</script>

<style scoped>
.sidebar li a:hover {
  background-color: #ffb703;
}
</style>
