// Исходный запрос может содержать пароль и cookie.
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
