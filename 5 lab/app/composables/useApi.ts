/** Назначение: запросы к своему Nuxt-транспорту, без JWT в браузерном JavaScript.
 * Данные: страница → /api/backend/* → Java через server/api/backend/[...path].ts.
 * Связи: useAuth/useStudents, runtimeConfig.public.apiBase; источник 4 lab/src/api/http.js.
 * TODO: нормализовать ошибки Java, AbortSignal и повтор после refresh; не переносить sessionStorage.
 * Проверка: SSR передаёт cookie только своему origin, браузер не обращается к Docker hostname Java.
 */
export function useApi() {
  const config = useRuntimeConfig()
  // Получаем fetch внутри Nuxt-контекста: на SSR он передаёт cookie текущего запроса.
  const requestFetch = useRequestFetch()
  // Не используем .create(): request-bound fetch на сервере — обёртка текущего event.
  return <T>(path: string, options: Parameters<typeof requestFetch<T>>[1] = {}) =>
    requestFetch<T>(path, { ...options, baseURL: config.public.apiBase })
}
