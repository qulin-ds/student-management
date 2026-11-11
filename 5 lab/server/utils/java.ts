import type { TokenResponse } from '../../shared/types/api'

/**
 * Транспорт к фиксированному Java API. Здесь нет проверки подписи JWT и работы с БД.
 * Вход: путь, метод, DTO и access. Выход: статус и JSON Java; сетевой сбой становится 503.
 * Связи: api/backend/[...path].ts. Проверка: Java offline, ошибки 422 и ответ DELETE 204.
 */
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

// Это не кеш студентов/профилей: только короткая координация ротации ОДНОЙ сессии.
// Ключ — хеш refresh, значение — общий выполняющийся запрос и его результат на 5 секунд.
// Так два SSR-запроса/вкладки со старой cookie получают одну и ту же новую пару.
// Ограничение: один процесс Nuxt. Для нескольких реплик нужна общая координация сессий.
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
