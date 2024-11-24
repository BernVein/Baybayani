<template>
  <div class="flex h-screen">
    <!-- Sidebar Layout -->
    <SideBarLayout class="sidebar" />

    <!-- Admin Layout -->
    <AdminLayout class="admin-layout">
      <div
        class="main-content flex-1 flex flex-col items-center justify-center"
      >
        <!-- Centered Button -->
        <button
          :class="{
            'bg-red-500 hover:bg-red-600 text-white': isDashboardOpen,
            'bg-green-500 hover:bg-green-600 text-white': !isDashboardOpen,
          }"
          class="px-6 py-3 rounded-lg font-semibold text-xl"
          @click="toggleDashboard"
        >
          {{ isDashboardOpen ? "Dashboard Opened" : "Open Dashboard" }}
        </button>

        <!-- Instruction Text -->
        <p class="mt-4 text-center text-sm text-gray-600">
          Click "Open Dashboard" if you aren't directed to the chat dashboard
          directly.
        </p>
      </div>
    </AdminLayout>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import SideBarLayout from "~/layouts/SideBarLayout.vue";
import AdminLayout from "~/layouts/AdminLayout.vue";
import { useUserStore } from "~/stores/user";

export default {
  name: "ChatPage",
  components: {
    SideBarLayout,
    AdminLayout,
  },
  setup() {
    const userStore = useUserStore();

    userStore.isAdmin();

    const user = useSupabaseUser();
    const route = useRoute();

    watchEffect(() => {
      if (
        route.fullPath == "/admin/chat" &&
        (!user.value || userStore.isAdmin === false)
      ) {
        navigateTo("/login");
      }
    });

    const isDashboardOpen = ref(false);
    let dashboardWindow = null;

    const toggleDashboard = () => {
      if (isDashboardOpen.value && dashboardWindow && !dashboardWindow.closed) {
        // Focus on the already open tab
        dashboardWindow.focus();
      } else {
        // Open a new tab and store the window reference
        dashboardWindow = window.open(
          "https://dashboard.tawk.to/#/chat",
          "_blank"
        );
        if (dashboardWindow) {
          isDashboardOpen.value = true;

          // Track if the window gets closed
          const checkClosed = setInterval(() => {
            if (dashboardWindow.closed) {
              isDashboardOpen.value = false;
              clearInterval(checkClosed);
            }
          }, 500);
        }
      }
    };

    onMounted(() => {
      // Automatically open the dashboard tab when the page loads
      toggleDashboard();
    });

    return {
      toggleDashboard,
      isDashboardOpen,
    };
  },
};
</script>

<style scoped>
.sidebar {
  width: 300px;
  background: #f5f5f5;
}

.admin-layout {
  flex: 1;
}

.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
