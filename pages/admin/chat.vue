<template>
  <div class="flex h-screen">
    <!-- Sidebar Layout -->
    <SideBarLayout class="sidebar" />

    <!-- Admin Layout -->
    <LayoutAdmin class="admin-layout">
      <!-- CometChat Embedded Widget -->
      <div id="cometchat"></div>
    </LayoutAdmin>
  </div>
</template>

<script>
import { onMounted } from "vue";
import SideBarLayout from "~/layouts/SideBarLayout.vue";
import LayoutAdmin from "~/layouts/LayoutAdmin.vue";
import { useUserStore } from "~/stores/user";


export default {
  name: "ChatPage",
  components: {
    SideBarLayout,
    LayoutAdmin,
  },
  setup() {

    const userStore = useUserStore();

    const user = useSupabaseUser();
    const role = userStore.profile?.role;
    const route = useRoute();



    watchEffect(() => {
      if (
        route.fullPath == "/admin/chat" &&
        (!user.value || role === "User")
      ) {
        navigateTo("/login");
      }
    });

    onMounted(() => {
      // Load the CometChat Widget script dynamically
      const script = document.createElement("script");
      script.src = "https://widget-js.cometchat.io/v3/cometchatwidget.js";
      script.defer = true;


      script.onload = () => {
        CometChatWidget.init({
          appID: "267505e7582e8c70",
          appRegion: "us",
          authKey: "aab766213fba5c11e11ede09f1f0d0d0735dd6f9",
        }).then(() => {
          //  console.log("Initialization completed successfully");

          // Log in a user
          CometChatWidget.login({
            uid: "baybayaniadmin", // Replace with the user's UID
          }).then(() => {
            // console.log("User login successful");


            CometChatWidget.launch({
              widgetID: "ce919709-5388-4331-a9c4-64c5ced133f5",
              target: "#cometchat",
              roundedCorners: "false",
              height: `100%`,
              width: `100%`,
              defaultID: "baybayaniadmin",
              defaultType: "user",
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
  bottom: 0;
  left: 260px;
  border: 1px solid #ccc;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  width: calc(100% - 250px);
  height: calc(100vh - 95px);
  background-color: #fff;
  z-index: 1000;
  overflow: hidden;
}
</style>
