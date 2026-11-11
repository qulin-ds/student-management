import type { CurrentUser } from '~~/shared/types/api'

// Promise восстановления живёт только в текущем приложении/SSR-запросе и не сериализуется.
declare module '#app' {
  interface NuxtApp { _smRestore?: Promise<CurrentUser | null> }
}
export {}
