import type {
  DataResponse,
  PageResponse,
  StudentDto,
  StudentSearchRequest,
} from '~~/shared/types/api'
import { studentFilters } from '~~/shared/utils/student-filters'

export function useStudents() {
  const { user } = useAuth()
  const api = useApi()
  const app = useNuxtApp()
  const times = useState<Record<string, number>>(
    'students:times',
    () => ({}),
  )

  function listKey(filters: StudentSearchRequest) {
    return `students:${user.value?.username ?? 'guest'}:list:${JSON.stringify(studentFilters(filters))}`
  }

  function detailKey(isu: number) {
    return `students:${user.value?.username ?? 'guest'}:detail:${isu}`
  }

  async function invalidate() {
    const keys = Object.keys(times.value)
    for (const key of keys) times.value[key] = 0

    await app.runWithContext(() => refreshNuxtData(keys))
  }

  async function remove(isu: number) {
    await api(`/admin/students/${isu}`, { method: 'DELETE' })
    await invalidate()
  }

  function cached<T>(
    key: string,
    app: ReturnType<typeof useNuxtApp>,
    cause: string,
  ): T | undefined {
    if (cause.startsWith('refresh:')) {
      return undefined
    }

    if (
      app.isHydrating ||
      Date.now() - (times.value[key] ?? 0) < 30_000
    ) {
      return app.payload.data[key] as T | undefined
    }

    return undefined
  }

  return {
    api,
    times,
    listKey,
    detailKey,
    invalidate,
    remove,
    cached,
  }
}

export function useStudentList(
  filters: MaybeRefOrGetter<StudentSearchRequest>,
) {
  const service = useStudents()
  const key = computed(() => service.listKey(toValue(filters)))

  return useAsyncData(
    key,
    async (_app, { signal }) => {
      const currentKey = key.value
      service.times.value[currentKey] ??= 0
      const result = await service.api<PageResponse<StudentDto>>(
        '/user/students/search',
        {
          method: 'POST',
          body: studentFilters(toValue(filters)),
          signal,
        },
      )

      signal.throwIfAborted()
      service.times.value[currentKey] = Date.now()
      return result
    },
    {
      deep: false,
      getCachedData: (key, app, context) =>
        service.cached<PageResponse<StudentDto>>(
          key,
          app,
          context.cause,
        ),
    },
  )
}

export function useStudentCard(isu: MaybeRefOrGetter<number>) {
  const service = useStudents()
  const key = computed(() => service.detailKey(toValue(isu)))

  return useAsyncData(
    key,
    async (_app, { signal }) => {
      const currentKey = key.value
      service.times.value[currentKey] ??= 0
      const result = await service.api<DataResponse<StudentDto>>(
        `/user/students/${toValue(isu)}`,
        { signal },
      )

      signal.throwIfAborted()
      service.times.value[currentKey] = Date.now()
      return result.data
    },
    {
      deep: false,
      getCachedData: (key, app, context) =>
        service.cached<StudentDto>(key, app, context.cause),
    },
  )
}
