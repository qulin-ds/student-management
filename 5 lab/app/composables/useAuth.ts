import type {
  CurrentUser,
  LoginRequest,
  RegisterRequest,
} from '~~/shared/types/api'
import { errorStatus } from '~~/shared/utils/api-error'

/**
 * Назначение: состояние текущего пользователя в пределах Nuxt-приложения/SSR-запроса.
 * Данные: GET /api/backend/auth/me → user → middleware, профиль и меню.
 * Связи: useApi.ts, access.global.ts, транспорт; перенос логики из 4 lab/src/stores/auth.js.
 * Не хранить JWT в useState: его содержимое сериализуется в HTML. Нет ref на уровне модуля!
 * Проверка: F5 сохраняет реальную сессию, два браузера не разделяют user; ошибки не дают ложный вход.
 */
export function useAuth() {
  const user = useState<CurrentUser | null>('auth:user', () => null)
  const initialized = useState('auth:initialized', () => false)
  const pending = useState('auth:pending', () => false)
  const api = useApi()
  const app = useNuxtApp()
  const times = useState<Record<string, number>>(
    'students:times',
    () => ({}),
  )

  function clearData() {
    app.runWithContext(() =>
      clearNuxtData((key) => key.startsWith('students:')),
    )
    times.value = {}
  }

  async function restoreSession(
    force = false,
  ): Promise<CurrentUser | null> {
    if (initialized.value && !force) {
      return user.value
    }

    // Promise находится в текущем NuxtApp, а не общем модуле сервера.
    if (app._smRestore) {
      return app._smRestore
    }

    const request = (async () => {
      try {
        const current = await api<CurrentUser>('/auth/me')

        if (
          !['USER', 'ADMIN'].includes(current.role) ||
          typeof current.username !== 'string'
        ) {
          throw new Error('Некорректный профиль Java')
        }

        user.value = current
        initialized.value = true
        return current
      } catch (cause) {
        if (errorStatus(cause) !== 401) {
          throw cause
        }

        user.value = null
        initialized.value = true
        clearData()
        return null
      }
    })()

    app._smRestore = request

    try {
      return await request
    } finally {
      delete app._smRestore
    }
  }

  async function authenticate(
    path: string,
    input: LoginRequest | RegisterRequest,
  ) {
    pending.value = true

    try {
      await api(path, {
        method: 'POST',
        body: input,
      })

      clearData()

      const current = await restoreSession(true)

      if (!current) {
        throw new Error('Не удалось восстановить пользователя после входа')
      }

      return current
    } finally {
      pending.value = false
    }
  }

  async function login(input: LoginRequest): Promise<CurrentUser> {
    return authenticate('/auth/login', input)
  }

  async function register(input: RegisterRequest): Promise<CurrentUser> {
    return authenticate('/auth/register', input)
  }

  async function logout(): Promise<void> {
    pending.value = true

    try {
      await api('/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      initialized.value = true
      clearData()
      pending.value = false
    }
  }

  return {
    user,
    initialized,
    pending,
    restoreSession,
    login,
    register,
    logout,
  }
}
