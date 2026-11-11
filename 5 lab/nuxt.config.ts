// Назначение: SSR, адреса транспорта и оформление приложения.
// Данные: .env → runtimeConfig → useApi и server/api/backend/[...path].ts.
// Связи: Dockerfile, .env.example; из 4 lab/vite.config.js переносится только смысл адреса API.
// TODO: не включать общий кеш страниц с пользователем.
// Проверка: npm run build; без Java страницы каркаса тоже должны собираться.
export default defineNuxtConfig({
  compatibilityDate: '2026-11-10',
  ssr: true,
  devtools: { enabled: false },
  // CSS четвёртой работы скопирован без изменений; затем идут стили учебного каркаса.
  css: ['~/assets/css/lab4.css', '~/assets/css/main.css'],
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
