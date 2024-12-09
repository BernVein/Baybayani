import { ref } from "vue";
import { useSupabaseClient } from "@supabase/supabase-js";

// Setup variables to hold form states and messages
const email = ref("");
const password = ref("");
const name = ref(""); // Full name
const contactNumber = ref(""); // Optional contact number
const role = ref("USER"); // Default role is USER
const errorMsg = ref(null);
const successMsg = ref(null);

const client = useSupabaseClient(); // Supabase client initialization

// Register function
export const registerUser = async (userData = {}) => {
  // Assign values from userData if provided
  email.value = userData.email || email.value;
  password.value = userData.password || password.value;
  name.value = userData.name || name.value;
  contactNumber.value = userData.contactNumber || contactNumber.value;
  role.value = userData.role || role.value;

  try {
    // Register with Supabase Auth
    const { data, error } = await client.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          name: name.value,
          contactNumber: contactNumber.value,
          role: role.value,
        },
      },
    });

    // Handle errors from Supabase Auth
    if (error) {
      errorMsg.value = error.message;
      successMsg.value = null;
      console.error("Registration Error: ", error.message);
      return { success: false, message: error.message };
    }

    // Handle registration success
    successMsg.value = "Successfully registered!";
    errorMsg.value = null;

    // If using a backend for further user data storage
    try {
      const response = await useFetch("/api/createUser", {
        method: "POST",
        body: {
          id: data?.user?.id,
          email: email.value,
          name: name.value || "New User", // Use name if provided, otherwise use a default
          contactNumber: contactNumber.value || "", // Optional field
          role: role.value, // Role (USER/ADMIN)
        },
      });

      if (response.success) {
        //   console.log("User data saved successfully");
        return { success: true, message: "User registered and data saved." };
      } else {
        console.error("Error saving user data");
        return { success: false, message: "Error saving user data." };
      }
    } catch (error) {
      console.error("Backend Error: ", error.message);
      return { success: false, message: "Error saving user to backend." };
    }
  } catch (error) {
    errorMsg.value = error.message;
    successMsg.value = null;
    console.error("Unexpected Registration Error: ", error.message);
    return { success: false, message: error.message };
  }
};
