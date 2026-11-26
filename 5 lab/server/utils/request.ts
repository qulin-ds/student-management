import type { TokenResponse } from '../../shared/types/api'

export async function requestBackend(
  base: string,
  path: string,
  method: string,
  body?: unknown,
  access?: string,
  streamSignal?: AbortSignal,
) {
  let response: Response
  const streamTimeout = new AbortController()
  const timer = streamSignal
    ? setTimeout(() => streamTimeout.abort(), 10_000)
    : undefined

  try {
    response = await fetch(
      `${base.replace(/\/$/, '')}/${path}`,
      {
        method,
        headers: {
          Accept: streamSignal ? 'text/event-stream' : 'application/json',
          ...(body === undefined
            ? {}
            : { 'Content-Type': 'application/json' }),
          ...(access
            ? { Authorization: `Bearer ${access}` }
            : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: streamSignal
          ? AbortSignal.any([streamSignal, streamTimeout.signal])
          : AbortSignal.timeout(10_000),
        redirect: 'error',
      },
    )
  } catch {
    throw createError({
      statusCode: 503,
      message: 'Java-сервер недоступен. Повторите запрос.',
    })
  } finally {
    clearTimeout(timer)
  }

  if (streamSignal && response.ok) {
    if (response.body && response.headers.get('content-type')?.startsWith('text/event-stream')) {
      return { status: response.status, data: response.body }
    }

    await response.body?.cancel()
    throw createError({
      statusCode: 502,
      message: 'Java-сервер не открыл поток событий.',
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

const rotations = new Map<
  string,
  Promise<Awaited<ReturnType<typeof requestBackend>>>
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

  if (rotations.size >= 256) {
    throw createError({
      statusCode: 503,
      message: 'Повторите обновление сессии чуть позже.',
    })
  }

  const request = requestBackend(
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
