import { sendStream } from 'h3'
import { forgetRotation, latestRefresh, requestBackend, rotateSession, tokenPair } from '../../utils/request'
import type { TokenResponse } from '../../../shared/types/api'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const path = getRouterParam(event, 'path') ?? ''

  const method = event.method

  const allowedRoutes = [
    { method: 'POST', path: /^auth\/login$/ },
    { method: 'POST', path: /^auth\/register$/ },
    { method: 'POST', path: /^auth\/refresh$/ },
    { method: 'POST', path: /^auth\/logout$/ },
    { method: 'GET', path: /^auth\/me$/ },

    { method: 'GET', path: /^user\/students$/ },
    { method: 'GET', path: /^user\/students\/(events|version)$/ },
    { method: 'POST', path: /^user\/students\/search$/ },
    { method: 'GET', path: /^user\/students\/\d+$/ },

    { method: 'POST', path: /^admin\/students$/ },
    { method: 'PUT', path: /^admin\/students\/\d+$/ },
    { method: 'PATCH', path: /^admin\/students\/\d+$/ },
    { method: 'DELETE', path: /^admin\/students\/\d+$/ },
  ]

  const isAllowed = allowedRoutes.some((route) => {
    return route.method === method && route.path.test(path)
  })

  if (!isAllowed) {
    throw createError({
      statusCode: 404,
      statusMessage: 'API route not found',
    })
  }

  const config = useRuntimeConfig(event)
  const accessName = 'sm_access'
  const refreshName = 'sm_refresh'
  const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure: config.cookieSecure, path: '/' }
  const access = getCookie(event, accessName)
  const refresh = getCookie(event, refreshName)

  if (method !== 'GET') {
    const origin = getHeader(event, 'origin')
    if (getHeader(event, 'x-student-client') !== '1'
      || getHeader(event, 'sec-fetch-site') === 'cross-site'
      || (origin && origin !== getRequestURL(event).origin)) {
      throw createError({ statusCode: 403, message: 'Недопустимый источник запроса.' })
    }
  }

  const streaming = path === 'user/students/events'
  if (streaming && getHeader(event, 'sec-fetch-site') === 'cross-site') {
    throw createError({ statusCode: 403, message: 'Недопустимый источник запроса.' })
  }

  function clearSession() {
    deleteCookie(event, accessName, cookieOptions)
    deleteCookie(event, refreshName, cookieOptions)
  }
  function saveSession(pair: TokenResponse) {
    setCookie(event, accessName, pair.accessToken, cookieOptions)
    setCookie(event, refreshName, pair.refreshToken, cookieOptions)
  }
  function send(result: Awaited<ReturnType<typeof requestBackend>>) {
    setResponseStatus(event, result.status)
    return result.data
  }
  function unauthorized() {
    clearSession()
    throw createError({ statusCode: 401, message: 'Войдите в систему.' })
  }

  if (path === 'auth/logout') {
    try {
      if (refresh) {
        const current = await latestRefresh(refresh)
        const result = await requestBackend(config.javaApiBase, path, method, { refreshToken: current })
        await forgetRotation(refresh)
        await forgetRotation(current)
        return send(result)
      }
      setResponseStatus(event, 204)
      return
    } finally {
      clearSession()
    }
  }

  if (path === 'auth/login' || path === 'auth/register') {
    const body: unknown = await readBody(event)
    const result = await requestBackend(config.javaApiBase, path, method, body)
    if (result.status >= 400) return send(result)
    saveSession(tokenPair(result.data))
    setResponseStatus(event, result.status)
    return { success: true }
  }

  if (path === 'auth/refresh') {
    if (!refresh) return unauthorized()
    const result = await rotateSession(config.javaApiBase, refresh)
    if (result.status === 401) return unauthorized()
    if (result.status >= 400) return send(result)
    saveSession(tokenPair(result.data))
    return { success: true }
  }

  if (!access && !refresh) return unauthorized()
  const body: unknown = method === 'GET' || method === 'DELETE' ? undefined : await readBody(event)
  const query = path === 'user/students' ? new URLSearchParams(getQuery(event) as Record<string, string>).toString() : ''
  const target = `${path}${query ? `?${query}` : ''}`
  const connection = streaming ? new AbortController() : undefined
  if (connection) {
    event.node.res.once('close', () => connection.abort())
  }
  const request = (token?: string) =>
    requestBackend(config.javaApiBase, target, method, body, token, connection?.signal)
  let result = await request(access)
  if (result.status === 401 && refresh) {
    const rotated = await rotateSession(config.javaApiBase, refresh)
    if (rotated.status === 401) return unauthorized()
    if (rotated.status >= 400) return send(rotated)
    const pair = tokenPair(rotated.data)
    saveSession(pair)
    result = await request(pair.accessToken)
  }
  if (result.status === 401) return unauthorized()
  if (streaming && result.data instanceof ReadableStream) {
    setResponseHeader(event, 'Content-Type', 'text/event-stream')
    setResponseHeader(event, 'Cache-Control', 'private, no-store, no-transform')
    setResponseHeader(event, 'X-Accel-Buffering', 'no')
    return sendStream(event, result.data)
  }
  return send(result)
})
