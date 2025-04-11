import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  pages: true,
  ssr: false,

  modules: [
    "nuxt-icon",
    "nuxt-lodash",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/supabase", // Supabase module
  ],

  runtimeConfig: {
    public: {
      stripePk: process.env.STRIPE_PK_KEY,
      apiUrl: process.env.API_URL || "http://localhost:3000",
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_KEY,
    },
  },

  app: {
    head: {
      title: "Baybayani: Food to Table",
      meta: [
        {
          name: "description",
          content: "A private e-commerce platform for Baybayani members.",
        },
      ],
      link: [{ rel: "icon", type: "image/png", href: "/tab-logo.png" }],
      script: [{ src: "https://js.stripe.com/v3/", defer: true }],
    },
  },

  router: {
    //middleware: ["auth"],
  },

  compatibilityDate: "2024-11-18",

  // ✅ Fix for cookie module export issue with Supabase SSR
  vite: {
    ssr: {
      noExternal: ['cookie', '@supabase/ssr', '@nuxtjs/supabase']
    }
  }
});
