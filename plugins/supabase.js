import { createClient } from '@supabase/supabase-js';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig(); // Fetch runtime configuration
  const supabaseUrl = config.public.SUPABASE_URL;
  const supabaseAnonKey = config.public.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Key is missing. Please make sure environment variables are properly set.");
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // Save session to localStorage
      detectSessionInUrl: true, // Handles OAuth redirects
    },
  });
  
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Error fetching session:', error);
    } else {
      console.log('Session data:', data.session);
    }
  });
  
  nuxtApp.provide('supabase', supabase);
});
