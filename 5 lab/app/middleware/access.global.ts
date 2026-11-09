import type { Role } from '~~/shared/types/api'

/** Назначение: SSR- и клиентская навигация по сессии и ролям (не проверка прав Java).
 * Вход: meta.requiresAuth/meta.roles и useAuth; выход: страница, /login либо /forbidden.
 * Связи: pages/*, useAuth.ts, .env.example; перенос beforeEach из 4 lab/src/router/index.js.
 * TODO: реализовать restoreSession; ошибки сети не превращать в гостя, показать 503 с повтором.
 * TODO: после входа разрешать redirect только внутри приложения: запретить //, /\ и страницы login/register.
 * Проверка: labPreview=false, F5 /profile → /login?redirect=...; USER → /students/new → /forbidden.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Явный режим учебного просмотра. Он не делает API доступным и не создаёт пользователя.
  if (useRuntimeConfig().public.labPreview) return
  const auth = useAuth()
  if (!auth.initialized.value) await auth.restoreSession()
  if (to.meta.requiresAuth && !auth.user.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
  const roles = to.meta.roles as Role[] | undefined
  if (roles?.length && (!auth.user.value || !roles.includes(auth.user.value.role))) {
    return navigateTo('/forbidden')
  }
  if (to.meta.guestOnly && auth.user.value) return navigateTo('/students')
})
