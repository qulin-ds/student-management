import type { TokenResponse } from '../../shared/types/api'

export async function javaRequest(
  base: string,
  path: string,
  method: string,
  body?: unknown,
  access?: string,
) {
  let response: Response

  try {
    response = await fetch(
      `${base.replace(/\/$/, '')}/${path}`,
      {
        method,
        headers: {
          Accept: 'application/json',
          ...(body === undefined
            ? {}
            : { 'Content-Type': 'application/json' }),
          ...(access
            ? { Authorization: `Bearer ${access}` }
            : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
        redirect: 'error',
      },
    )
  } catch {
    // Не включаем URL с телом запроса или токен в ошибку и логи.
    throw createError({
      statusCode: 503,
      message: 'Java-сервер недоступен. Повторите запрос.',
    })
  }

  if (response.status === 204) {
    return {
      status: 204,
      data: undefined,
    }
  }

  const data: unknown = await response.json().catch(() => null)

  if (!data) {
    throw createError({
      statusCode: 502,
      message: 'Java-сервер вернул некорректный ответ.',
    })
  }

  return {
    status: response.status,
    data,
  }
}

export function tokenPair(value: unknown): TokenResponse {
  const pair = value as Partial<TokenResponse> | null

  if (
    !pair ||
    typeof pair.accessToken !== 'string' ||
    typeof pair.refreshToken !== 'string'
  ) {
    throw createError({
      statusCode: 502,
      message: 'Java-сервер не вернул пару токенов.',
    })
  }

  return {
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken,
  }
}

// Параллельные запросы делят результат ротации в пределах одного процесса Nuxt.
const rotations = new Map<
  string,
  Promise<Awaited<ReturnType<typeof javaRequest>>>
>()

const sessionKey = async (token: string) => {
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token),
  )

  return Array.from(
    new Uint8Array(hash),
    (byte) => byte.toString(16).padStart(2, '0'),
  ).join('')
}

export async function rotateSession(base: string, refresh: string) {
  const key = await sessionKey(refresh)
  const previous = rotations.get(key)

  if (previous) {
    return previous
  }

  // Не вытесняем активные refresh: иначе повторный запрос ротирует тот же токен второй раз.
  if (rotations.size >= 256) {
    throw createError({
      statusCode: 503,
      message: 'Повторите обновление сессии чуть позже.',
    })
  }

  const request = javaRequest(
    base,
    'auth/refresh',
    'POST',
    { refreshToken: refresh },
  )

  rotations.set(key, request)

  request.then(
    (result) => {
      if (result.status >= 400) {
        rotations.delete(key)
      } else {
        setTimeout(() => rotations.delete(key), 5_000)
      }
    },
    () => rotations.delete(key),
  )

  return request
}

export async function latestRefresh(refresh: string) {
  // Выход ждёт уже начатую ротацию и отзывает актуальный refresh, а не старый.
  const pending = rotations.get(await sessionKey(refresh))

  if (!pending) {
    return refresh
  }

  const result = await pending

  return result.status < 400
    ? tokenPair(result.data).refreshToken
    : refresh
}

export async function forgetRotation(refresh: string) {
  rotations.delete(await sessionKey(refresh))
}
