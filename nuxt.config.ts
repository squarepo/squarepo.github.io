// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ["bootstrap/dist/css/bootstrap.min.css"],
  app: {
    head: {
      title: "Squarepo",
      link: [{ rel: "icon", href: "images/squarepo.svg" }],
      script: [{ src: '/scripts/auto-theme.js' }], // Dark & light theme
    }
  }
});
