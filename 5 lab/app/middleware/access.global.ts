import type { Role } from '~~/shared/types/api'
import { errorStatus } from '~~/shared/utils/api-error'

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
