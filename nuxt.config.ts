// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  pages: true,

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
      title: "Baybayani: Bringing Food to Your Table",
      meta: [
        { name: 'description', content: 'A private e-commerce platform for Baybayani members.' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/tab-logo.png' }
      ],
      script: [{ src: "https://js.stripe.com/v3/", defer: true }],
    },
  },

  router: {
    //middleware: ["auth"],
  },

  compatibilityDate: "2024-11-18",
});
