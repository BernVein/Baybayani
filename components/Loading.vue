<template>
    <div
      v-if="show"
      class="fixed inset-0 w-full h-full z-40 flex items-center justify-center bg-green-900 bg-opacity-50 backdrop-blur-sm overflow-hidden transition-opacity duration-300"
      :class="{ 'opacity-100': isVisible, 'opacity-0': !isVisible }"
    >
      <div
        class="p-6 rounded-lg bg-green-700 bg-opacity-80 shadow-lg animate-fade-in-up"
        @animationend="handleAnimationEnd"
      >
        <div class="flex items-center justify-center">
          <div class="loader"></div>
        </div>
        <div class="text-center pt-5 text-xl font-bold text-green-100">Loading...</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  
  // Local state
  const show = ref(true);
  const isVisible = ref(false);
  
  const handleAnimationEnd = () => {
    if (!isVisible.value) {
      show.value = false;
    }
  };
  
  onMounted(() => {
    setTimeout(() => {
      isVisible.value = true;
    }, 10);
  });
  
  // Expose hideLoading via an event or a prop-based method in your app.
  </script>
  
  <style>
  /* Loader animation */
  .loader {
    width: 40px;
    height: 40px;
    border: 5px solid rgba(255, 255, 255, 0.3);
    border-top: 5px solid #32cd32;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  /* Animations */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.5s ease-out;
  }
  </style>
  