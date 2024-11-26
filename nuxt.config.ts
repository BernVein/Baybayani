// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  pages: true, // Enable auto-import of pages

  modules: [
    "nuxt-icon",
    "nuxt-lodash",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/supabase",
  ],

  runtimeConfig: {
    public: {
      stripePk: process.env.STRIPE_PK_KEY,
      apiUrl: process.env.API_URL || 'http://localhost:3000',
      // Add Supabase Variables Here
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_KEY,
    },
  },

  app: {
    head: {
      script: [{ src: "https://js.stripe.com/v3/", defer: true }],
    },
  },

  router: {
    //middleware: ["auth"], // Uncomment if global middleware is needed
  },

  nitro: {
    preset: "vercel", // Optimize for Vercel deployment
  },

  ssr: true, // Ensure SSR is enabled (default, but explicitly set for clarity)

  // Build and optimization settings
  build: {
    transpile: ["@nuxtjs/supabase"], // Ensure Supabase is transpiled
  },

  compatibilityDate: "2024-11-18",

  // Add Vercel-specific environment handling
  hooks: {
    "nitro:config"(nitroConfig) {
      if (process.env.VERCEL) {
        nitroConfig.runtimeConfig = {
          ...nitroConfig.runtimeConfig,
          public: {
            stripePk: process.env.STRIPE_PK_KEY,
            apiUrl: process.env.API_URL || 'https://your-production-url.com',
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_ANON_KEY: process.env.SUPABASE_KEY,
          },
        };
      }
    },
  },
});
