<template>
  <div class="flex h-screen">
    <!-- Sidebar Layout -->
    <SideBarLayout class="sidebar" />

    <!-- Admin Layout -->
    <AdminLayout class="admin-layout">
      <!-- CometChat Embedded Widget -->
      <div id="cometchat"></div>
    </AdminLayout>
  </div>
</template>

<script>
import { onMounted } from "vue";
import SideBarLayout from "~/layouts/SideBarLayout.vue";
import AdminLayout from "~/layouts/AdminLayout.vue";

export default {
  name: "ChatPage",
  components: {
    SideBarLayout,
    AdminLayout,
  },
  setup() {
    onMounted(() => {
      // Load the CometChat Widget script dynamically
      const script = document.createElement("script");
      script.src = "https://widget-js.cometchat.io/v3/cometchatwidget.js";
      script.defer = true;


      script.onload = () => {
        // Initialize the CometChat widget after the script is loaded
        CometChatWidget.init({
          appID: "267505e7582e8c70",       // Replace with your App ID
          appRegion: "us", // Replace with your App Region
          authKey: "aab766213fba5c11e11ede09f1f0d0d0735dd6f9",     // Replace with your Auth Key
        }).then(() => {
          console.log("Initialization completed successfully");

          // Log in a user
          CometChatWidget.login({
            uid: "baybayaniadmin", // Replace with the user's UID
          }).then(() => {
            console.log("User login successful");

            // Launch the widget
            CometChatWidget.launch({
              widgetID: "ce919709-5388-4331-a9c4-64c5ced133f5",  // Replace with your Widget ID
              target: "#cometchat",   // Target div for embedding the widget
              roundedCorners: "true",
              height: "500px",
              width: "800px",
              defaultID: "baybayaniadmin", // Default UID or GUID to show
              defaultType: "user",          // "user" for one-on-one chat, "group" for group chat
            });
          }).catch((error) => {
            console.error("User login failed:", error);
          });
        }).catch((error) => {
          console.error("Initialization failed:", error);
        });
      };

      document.body.appendChild(script);
    });
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

#cometchat {
  position: fixed;
  bottom: 0; /* Ensures the widget is pinned to the bottom of the viewport */
  left: 300px; /* Aligns the widget to the left edge */
  right: 0; /* Stretches the widget to the right edge */
  border: none; /* Optional: Remove border for a cleaner look */
  border-radius: 0; /* No rounded corners for a flat bottom look */
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1); /* Shadow above the widget */
  width: 100%; /* Full-width widget */
  height: 500px; /* Adjust height to your preference */
  z-index: 1000; /* Ensure it stays above other elements */
  background-color: #fff; /* Ensure it blends with the design */
  overflow: hidden; /* Prevents any overflow */
}


</style>
