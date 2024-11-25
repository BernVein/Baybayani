<template>
  <div>
    <h1>CometChat Docked Widget</h1>
  </div>
</template>

<script>
export default {
  name: "CometChatDockedWidget",
  mounted() {
    // Load the CometChat Widget script dynamically
    const script = document.createElement("script");
    script.src = "https://widget-js.cometchat.io/v3/cometchatwidget.js";
    script.defer = true;

    script.onload = this.initializeCometChatWidget; // Call this method once script is loaded
    document.body.appendChild(script);
  },
  methods: {
    initializeCometChatWidget() {
      CometChatWidget.init({
        appID: "267505e7582e8c70", // Your App ID
        appRegion: "us",           // Your App Region
        authKey: "aab766213fba5c11e11ede09f1f0d0d0735dd6f9", // Your Auth Key
      })
        .then(() => {
          console.log("Initialization completed successfully");

          // Log in a user
          CometChatWidget.login({
            uid: "cometchat-uid-1", // Replace with the user's UID
          })
            .then(() => {
              console.log("User login successful");

              // Launch the widget in a docked layout
              CometChatWidget.launch({
                widgetID: "ce919709-5388-4331-a9c4-64c5ced133f5", // Replace with your Widget ID
                docked: "true",         // Enable docked layout
                alignment: "left",      // Choose "left" or "right"
                roundedCorners: "true", // Enable rounded corners
                height: "450px",        // Widget height
                width: "400px",         // Widget width
                defaultID: "cometchat-uid-1", // Default UID (user) or GUID (group)
                defaultType: "user",          // "user" for one-on-one chat, "group" for group chats
              });
            })
            .catch((error) => {
              console.error("User login failed:", error);
            });
        })
        .catch((error) => {
          console.error("Widget initialization failed:", error);
        });
    },
  },
};
</script>

<style>
/* No custom styles needed for docked layout */
</style>
