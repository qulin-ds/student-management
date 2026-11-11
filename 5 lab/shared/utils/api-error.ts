/**
 * Единая безопасная ошибка для компонентов. Вход — JSON Java/Nuxt, выход — message/status/details.
 * Не сохраняем исходный fetch request: в нём могут находиться пароль и Cookie.
 * Связи: useApi, ErrorMessage, страницы. Проверка: 422 показывает details, 503 — повтор запроса.
 */

export interface RequestError extends Error {
  status: number
  details: Record<string, string>
}

export function requestError(status: number, value: unknown): RequestError {
  const data = value as {
    error?: {
      message?: string
      details?: Record<string, string>
    }
    message?: string
  } | null

  return Object.assign(
    new Error(
      data?.error?.message ||
        data?.message ||
        'Не удалось выполнить запрос.',
    ),
    {
      status,
      details: data?.error?.details || {},
    },
  )
}

export function errorStatus(value: unknown) {
  const error = value as {
    status?: number
    statusCode?: number
  } | null

  return error?.status || error?.statusCode || 500
}
