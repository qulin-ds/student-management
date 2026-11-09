import type { CurrentUser, LoginRequest, RegisterRequest } from '~~/shared/types/api'

/** Назначение: состояние текущего пользователя в пределах Nuxt-приложения/SSR-запроса.
 * Данные: будущий GET /api/backend/auth/me → user → middleware, профиль и меню.
 * Связи: useApi.ts, access.global.ts, транспорт; перенос логики из 4 lab/src/stores/auth.js.
 * TODO: restoreSession через me, только 401 означает гостя; сетевую ошибку показывать отдельно.
 * TODO: login/register получают user после установки HttpOnly-cookie; logout очищает user и кеш.
 * Не хранить JWT в useState: его содержимое сериализуется в HTML. Нет ref на уровне модуля!
 * Проверка: F5 сохраняет реальную сессию, два браузера не разделяют user; ошибки не дают ложный вход.
 */
export function useAuth() {
  const user = useState<CurrentUser | null>('auth:user', () => null)
  const initialized = useState('auth:initialized', () => false)

  async function restoreSession() {
    // TODO: вызвать useApi()('/auth/me'), проверить USER/ADMIN; восстановить до проверки middleware.
    // Пока транспорт не реализован, пользователь остаётся гостем.
    initialized.value = true
    return user.value
  }
  async function login(_input: LoginRequest): Promise<CurrentUser> {
    // TODO: POST /auth/login, затем me; не сохранять пароль в useState.
    throw new Error('Вход ещё не реализован: начните с server/api/backend/[...path].ts')
  }
  async function register(_input: RegisterRequest): Promise<CurrentUser> {
    // TODO: POST /auth/register, затем me. Роль назначает Java, поля role в запросе нет.
    throw new Error('Регистрация ещё не реализована')
  }
  async function logout(): Promise<void> {
    // TODO: POST /auth/logout; в finally очистить user, clearNuxtData для students:*, перейти на /login.
    throw new Error('Выход ещё не реализован')
  }
  return { user, initialized, restoreSession, login, register, logout }
}
