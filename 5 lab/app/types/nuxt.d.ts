import type { CurrentUser } from '~~/shared/types/api'

declare module '#app' {
  interface NuxtApp {
    _smRestore?: Promise<CurrentUser | null>
  }
}

export {}
