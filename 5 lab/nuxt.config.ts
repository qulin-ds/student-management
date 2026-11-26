export default defineNuxtConfig({
  compatibilityDate: '2026-11-10',
  ssr: true,
  devtools: { enabled: false },
  css: ['~/assets/css/base.css', '~/assets/css/app.css'],
  runtimeConfig: {
    javaApiBase: 'http://localhost:8080/api',
    cookieSecure: false,
    public: {
      apiBase: '/api/backend',
    },
  },
  routeRules: {
    '/**': { headers: { 'cache-control': 'private, no-store' } },
  },
  app: { head: { htmlAttrs: { lang: 'ru' }, title: 'Управление студентами' } },
})
