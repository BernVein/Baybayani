// services/cometChatService.js

/**
 * Service for handling CometChat operations
 * This service provides methods for creating and managing CometChat users
 */

// CometChat API credentials
const COMETCHAT_APP_ID = "267505e7582e8c70";
const COMETCHAT_AUTH_KEY = "aab766213fba5c11e11ede09f1f0d0d0735dd6f9";
const COMETCHAT_REGION = "us";

/**
 * Create a new user in CometChat
 * @param {string} name - The user's full name
 * @param {string} uid - Optional user ID (if not provided, will generate from name)
 * @param {object} metadata - Optional additional user data
 * @returns {Promise} - Response from CometChat API
 */
export async function createCometChatUser(name, uid = null, metadata = {}) {
  try {
    // Format UID: remove spaces and convert to lowercase
    const formattedUid = uid || name.replace(/\s+/g, "").toLowerCase();
    
    // Prepare request payload
    const userData = {
      uid: formattedUid,
      name: name,
      role: "default",
      metadata: metadata
    };
    
    // API URL
    const apiUrl = `https://${COMETCHAT_APP_ID}.api-${COMETCHAT_REGION}.cometchat.io/v3/users`;
    
    // Make API call to CometChat
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apiKey': COMETCHAT_AUTH_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error("CometChat user creation failed:", result);
      throw new Error(result.message || "Failed to create CometChat user");
    }
    
    console.log("CometChat user created successfully:", result);
    return result;
  } catch (error) {
    console.error("Error creating CometChat user:", error);
    throw error;
  }
}

/**
 * Check if a user exists in CometChat
 * @param {string} uid - The user ID to check
 * @returns {Promise<boolean>} - Whether the user exists
 */
export async function checkCometChatUserExists(uid) {
  try {
    const formattedUid = uid.replace(/\s+/g, "").toLowerCase();
    
    // API URL
    const apiUrl = `https://${COMETCHAT_APP_ID}.api-${COMETCHAT_REGION}.cometchat.io/v3/users/${formattedUid}`;
    
    // Make API call to CometChat
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apiKey': COMETCHAT_AUTH_KEY,
        'Accept': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error("Error checking CometChat user:", error);
    return false;
  }
}