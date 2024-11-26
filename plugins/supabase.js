import { createClient } from '@supabase/supabase-js';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig(); // Fetch runtime configuration
  const supabaseUrl = config.public.SUPABASE_URL;
  const supabaseAnonKey = config.public.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Key is missing. Please make sure environment variables are properly set.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  nuxtApp.provide('supabase', supabase);
});
