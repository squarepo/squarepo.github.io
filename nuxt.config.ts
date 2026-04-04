// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: ["@pinia/nuxt"],
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  sourcemap: { client: 'hidden' },
  css: [
    "bootstrap/dist/css/bootstrap.min.css",
    "bootstrap-icons/font/bootstrap-icons.min.css"
  ],
  app: {
    head: {
      title: "Squarepo",
      viewport: "width=device-width, height=device-height, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=0",
      link: [{ rel: "icon", href: "/_squarepo/images/squarepo.svg" }],
      script: [{ src: '/_squarepo/scripts/auto-theme.js' }], // Dark & light theme
    }
  }
});
