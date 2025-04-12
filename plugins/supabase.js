import { createClient } from "@supabase/supabase-js";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig(); // Fetch runtime configuration
  const supabaseUrl = config.public.SUPABASE_URL;
  const supabaseAnonKey = config.public.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Supabase URL or Key is missing. Please make sure environment variables are properly set."
    );
    return;
  }

  // Check if $supabase is already provided
  if (nuxtApp.$supabase) {
    console.warn('Supabase client is already injected.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // Save session to localStorage
      detectSessionInUrl: true, // Handles OAuth redirects
      autoRefreshToken: true, // Automatically refresh the token
      storageKey: 'baybayani-auth-token', // Custom storage key
    },
  });

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error("Error fetching session:", error);
    } else {
      // Optionally log session data
      // console.log('Session data:', data.session);
    }
  });

  // Set up token refresh
  const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
  
  // Initial refresh check
  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("Failed to refresh session:", error);
    } else if (data?.session) {
      // Session refreshed successfully
      // console.log("Session refreshed successfully");
    }
  };
  
  // If in browser context, set up periodic refresh
  if (process.client) {
    // Set up interval to refresh token
    const refreshInterval = setInterval(refreshSession, REFRESH_INTERVAL);
    
    // Clean up on page unmount
    nuxtApp.hook('app:unmount', () => {
      clearInterval(refreshInterval);
    });
  }

  nuxtApp.provide("supabase", supabase);
});
