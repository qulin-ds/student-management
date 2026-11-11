import { requestError } from '~~/shared/utils/api-error'
import type { CurrentUser } from '~~/shared/types/api'

/**
 * Назначение: запросы к своему Nuxt-транспорту, без JWT в браузерном JavaScript.
 * Данные: страница → /api/backend/* → Java через server/api/backend/[...path].ts.
 * Связи: useAuth/useStudents, runtimeConfig.public.apiBase; источник 4 lab/src/api/http.js.
 * Refresh выполняется транспортом. Здесь нормализуем ошибку, переносим SSR-cookie и поддерживаем AbortSignal.
 * Проверка: SSR передаёт cookie только своему origin, браузер не обращается к Docker hostname Java.
 */
export function useApi() {
  const config = useRuntimeConfig()
  const app = useNuxtApp()
  const event = useRequestEvent()
  const incoming = useRequestHeaders(['cookie'])
  const outgoing = useResponseHeader('set-cookie')
  const user = useState<CurrentUser | null>('auth:user', () => null)
  const initialized = useState('auth:initialized', () => false)

  // Передавать cookie можно только внутреннему endpoint того же приложения.
  if (
    !config.public.apiBase.startsWith('/') ||
    config.public.apiBase.startsWith('//')
  ) {
    throw new Error('apiBase должен быть относительным путём Nuxt')
  }

  return async <T>(
    path: string,
    options: Parameters<typeof $fetch<T>>[1] = {},
  ): Promise<T> => {
    if (
      !path.startsWith('/') ||
      path.startsWith('//') ||
      path.includes('\\')
    ) {
      throw new Error('Недопустимый путь API')
    }

    const headers = new Headers(options.headers)
    headers.set('x-student-client', '1')

    if (import.meta.server) {
      headers.set(
        'cookie',
        String(event?.context.smCookie ?? incoming.cookie ?? ''),
      )
    }

    let response

    try {
      response = await $fetch.raw<T>(
        `${config.public.apiBase}${path}`,
        {
          ...options,
          headers,
          credentials: 'same-origin',
          retry: 0,
          ignoreResponseError: true,
        },
      )
    } catch (cause) {
      // AbortSignal — отмена старого поиска, а не ошибка для пользователя.
      if (options.signal?.aborted) {
        throw cause
      }

      throw requestError(503, {
        message: 'Сервер недоступен. Повторите запрос.',
      })
    }

    if (import.meta.server && event) {
      const cookies = response.headers.getSetCookie()

      if (cookies.length) {
        // Внутренний Set-Cookie сам не дойдёт до браузера: добавляем во внешний SSR-ответ.
        const existing = outgoing.value
        outgoing.value = [
          ...(Array.isArray(existing)
            ? existing
            : existing
              ? [String(existing)]
              : []),
          ...cookies,
        ]

        // Следующий запрос этого же SSR должен использовать НОВУЮ пару, не исходный Cookie.
        const jar = new Map(
          String(event.context.smCookie ?? incoming.cookie ?? '')
            .split(';')
            .filter(Boolean)
            .map((item) => {
              const [name, ...value] = item.trim().split('=')
              return [name!, value.join('=')]
            }),
        )

        for (const cookie of cookies) {
          const [name, ...value] = cookie.split(';')[0]!.split('=')

          if (/max-age=0/i.test(cookie)) {
            jar.delete(name!)
          } else {
            jar.set(name!, value.join('='))
          }
        }

        event.context.smCookie = [...jar]
          .map(([name, value]) => `${name}=${value}`)
          .join('; ')
      }
    }

    if (response.status >= 400) {
      if (
        response.status === 401 &&
        !['/auth/login', '/auth/register'].includes(path)
      ) {
        user.value = null
        initialized.value = true
        app.runWithContext(() =>
          clearNuxtData((key) => key.startsWith('students:')),
        )
      }

      throw requestError(response.status, response._data)
    }

    return response._data as T
  }
}
