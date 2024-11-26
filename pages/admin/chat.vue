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
              height: `100%`, // Use calculated height
              width: `100%`,
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
  bottom: 0; /* Pins the widget to the bottom of the viewport */
  left: 260px; /* Starts the widget next to the sidebar (adjust width of sidebar if needed) */
  border: 1px solid #ccc;
  border-radius: 20px; /* Rounded top corners only */
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1); /* Shadow above the widget */
  width: calc(100% - 250px); /* Full width minus the sidebar */
  height: calc(100vh - 95px); /* Height respects the navbar (70px is navbar height) */
  background-color: #fff; /* Clean white background */
  z-index: 1000; /* Keep it above other elements */
  overflow: hidden; /* Prevent overflow issues */
}




</style>
