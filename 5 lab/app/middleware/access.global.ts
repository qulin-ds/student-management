import type { Role } from '~~/shared/types/api'
import { errorStatus } from '~~/shared/utils/api-error'

/**
 * Назначение: SSR- и клиентская навигация по сессии и ролям (не проверка прав Java).
 * Вход: meta.requiresAuth/meta.roles и useAuth; выход: страница, /login либо /forbidden.
 * Связи: pages/*, useAuth.ts, .env.example; перенос beforeEach из 4 lab/src/router/index.js.
 * Сеть не означает выход: показываем страницу ошибки с возможностью повторить запрос.
 * Проверка: F5 /profile → /login?redirect=...; USER → /students/new → /forbidden.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.meta.requiresAuth && !to.meta.guestOnly) {
    return
  }

  const auth = useAuth()

  try {
    await auth.restoreSession()
  } catch (cause) {
    throw createError({
      statusCode: errorStatus(cause),
      message: 'Не удалось проверить сессию. Повторите запрос.',
    })
  }

  if (to.meta.requiresAuth && !auth.user.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  const roles = to.meta.roles as Role[] | undefined

  if (
    roles?.length &&
    (!auth.user.value || !roles.includes(auth.user.value.role))
  ) {
    return navigateTo('/forbidden')
  }

  if (to.meta.guestOnly && auth.user.value) {
    return navigateTo('/students')
  }
})
