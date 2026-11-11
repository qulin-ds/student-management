import type { DataResponse, PageResponse, StudentDto, StudentSearchRequest } from '~~/shared/types/api'
import { studentFilters } from '~~/shared/utils/student-filters'

/** Назначение: SSR-чтение списка/карточки, удаление и кеш текущего пользователя.
 * Данные: фильтры страницы → Java через useApi → PageResponse/StudentDto → компоненты.
 * Связи: pages/students/*, shared/types/api.ts; перенос из 4 lab/src/api/students.js и stores/students.js.
 * useAsyncData передаёт результат SSR в браузер без второго начального запроса.
 * Кеш живёт 30 секунд внутри NuxtApp; общего кеша персональных данных на сервере нет.
 * Проверка: исходный HTML содержит данные после реализации; смена фильтра/page меняет ключ, CRUD обновляет список.
 */
export function useStudents() {
  const { user } = useAuth()
  const api = useApi()
  const app = useNuxtApp()
  const times = useState<Record<string, number>>('students:times', () => ({}))
  function listKey(filters: StudentSearchRequest) {
    return `students:${user.value?.username ?? 'guest'}:list:${JSON.stringify(studentFilters(filters))}`
  }
  function detailKey(isu: number) {
    return `students:${user.value?.username ?? 'guest'}:detail:${isu}`
  }
  async function invalidate() {
    const keys = Object.keys(times.value)
    times.value = {}
    app.runWithContext(() => clearNuxtData(key => key.startsWith('students:')))
    // Обновляем существующие обработчики, включая открытый список или карточку.
    // Неактивные варианты уже очищены и при возвращении загрузятся заново.
    await app.runWithContext(() => refreshNuxtData(keys))
  }
  async function remove(isu: number) {
    await api(`/admin/students/${isu}`, { method: 'DELETE' })
    await invalidate()
  }
  function cached<T>(key: string, app: ReturnType<typeof useNuxtApp>, cause: string): T | undefined {
    if (cause.startsWith('refresh:')) return undefined
    if (app.isHydrating || Date.now() - (times.value[key] ?? 0) < 30_000) return app.payload.data[key] as T | undefined
    return undefined
  }
  return { api, times, listKey, detailKey, invalidate, remove, cached }
}

export function useStudentList(filters: MaybeRefOrGetter<StudentSearchRequest>) {
  const service = useStudents()
  const key = computed(() => service.listKey(toValue(filters)))
  return useAsyncData(key, async (_app, { signal }) => {
    const currentKey = key.value
    const result = await service.api<PageResponse<StudentDto>>('/user/students/search', { method: 'POST', body: studentFilters(toValue(filters)), signal })
    service.times.value[currentKey] = Date.now()
    return result
  }, { deep: false, getCachedData: (key, app, context) => service.cached<PageResponse<StudentDto>>(key, app, context.cause) })
}

export function useStudentCard(isu: MaybeRefOrGetter<number>) {
  const service = useStudents()
  const key = computed(() => service.detailKey(toValue(isu)))
  return useAsyncData(key, async (_app, { signal }) => {
    const currentKey = key.value
    const result = await service.api<DataResponse<StudentDto>>(`/user/students/${toValue(isu)}`, { signal })
    service.times.value[currentKey] = Date.now()
    return result.data
  }, { deep: false, getCachedData: (key, app, context) => service.cached<StudentDto>(key, app, context.cause) })
}
