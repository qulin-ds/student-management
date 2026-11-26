export default defineNuxtConfig({
  compatibilityDate: '2026-11-10',
  ssr: true,
  devtools: { enabled: false },
  css: ['~/assets/css/lab4.css', '~/assets/css/main.css'],
  runtimeConfig: {
    javaApiBase: 'http://localhost:8080/api',
    cookieSecure: false,
    public: {
      apiBase: '/api/backend',
    },
  },
  // Страницы с пользовательскими данными должны оставаться вне общего кеша.
  routeRules: {
    '/**': { headers: { 'cache-control': 'private, no-store' } },
  },
  app: { head: { htmlAttrs: { lang: 'ru' }, title: 'Управление студентами' } },
})
