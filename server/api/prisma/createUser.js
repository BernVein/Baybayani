// /api/createUser.js (or createUser.ts if you're using TypeScript)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CometChat API credentials
const COMETCHAT_APP_ID = "267505e7582e8c70";
const COMETCHAT_AUTH_KEY = "aab766213fba5c11e11ede09f1f0d0d0735dd6f9";
const COMETCHAT_REGION = "us";

// Function to create CometChat user
async function createCometChatUser(name) {
  try {
    // Format UID: remove spaces and convert to lowercase
    const uid = name.replace(/\s+/g, "").toLowerCase();
    
    // Prepare request payload
    const userData = {
      uid: uid,
      name: name,
      role: "default"
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
    
    const responseData = await response.json();
    
    if (!response.ok) {
      // Check if error is because user already exists
      if (responseData.error && responseData.error.code === "ERR_UID_ALREADY_EXISTS") {
        console.log("CometChat user already exists, skipping creation");
        return { success: true, data: { uid }, alreadyExists: true };
      }
      
      console.error("Failed to create CometChat user:", responseData);
      return { success: false, error: responseData };
    }
    
    console.log("CometChat user created successfully:", responseData);
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error creating CometChat user:", error);
    return { success: false, error: error.message };
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  const { id, email, name, contact, role, status, validId } = body;

  // Store the user data in Prisma
  try {
    // 1. Create the user in the database
    const user = await prisma.user.create({
      data: {
        id,                 // Supabase Auth user ID
        email,              // User email from the request
        name,               // User name
        contact,            // User contact number
        role,               // User role (you can assign "USER" by default or make it dynamic)
        status,             // User status (ACTIVE or SUSPENDED)
        validId,            // Valid ID image in base64 format
        created_at: new Date(), // Timestamp when the user is created
      },
    });

    // 2. Create the user in CometChat only if not an Admin
    let cometChatResult = { success: true, skipped: true, reason: "Admin user - CometChat creation skipped" };
    
    if (role.toLowerCase() !== "admin") {
      cometChatResult = await createCometChatUser(name);
    } else {
      console.log(`Skipping CometChat creation for admin user: ${name}`);
    }
    
    return {
      success: true,
      user: user,
      cometChat: cometChatResult
    };
  } catch (error) {
    console.error("Error saving user to database:", error);
    return {
      success: false,
      error: 'Error creating user in database.',
      details: error.message
    };
  }
});
