<!-- Назначение: SSR-список; фильтры URL → POST /api/user/students/search → PageResponse → компоненты.
Связи: useStudents.ts, useApi.ts, StudentFilters/StudentsTable/StudentPagination.
Перенос: 4 lab/src/pages/StudentsPage.vue; первый onMounted заменить await useFetch/useAsyncData.
Фильтры берутся из URL; изменение имени отменяет старый запрос и ждёт 300 мс.
После DELETE обновляем кеш; если страница опустела, переходим на предыдущую.
Проверка: view-source содержит реальные строки после реализации, F5 сохраняет фильтры, page=0 — первая страница. -->
<script setup lang="ts">
import type { SortField, StudentSearchRequest } from '~~/shared/types/api'
import { studentFilters } from '~~/shared/utils/student-filters'
import { errorStatus, type RequestError } from '~~/shared/utils/api-error'
definePageMeta({ requiresAuth: true, roles: ['USER', 'ADMIN'] })
const route = useRoute()
const filters = computed(() => studentFilters(route.query))
const draft = reactive<Record<string, unknown>>({ ...filters.value })
const service = useStudents()
const { user } = useAuth()
const { data, pending, error, refresh, clear } = await useStudentList(filters)
const deleting = ref(false)
const searching = ref(false)
const actionError = ref<RequestError | null>(null)
const busy = computed(() => pending.value || deleting.value || searching.value)
const isAdmin = computed(() => user.value?.role === 'ADMIN')

// В адресе только известные поля DTO; значения строковые, false явно сохраняется.
function setQuery(input: StudentSearchRequest) {
  const query = Object.fromEntries(Object.entries(studentFilters(input)).map(([key, value]) => [key, String(value)]))
  return navigateTo({ path: '/students', query })
}
function apply() { clearTimeout(timer); searching.value = false; return setQuery({ ...studentFilters(draft), page: 0 }) }
function reset() {
  for (const key of Object.keys(draft)) delete draft[key]
  Object.assign(draft, studentFilters({}))
  return apply()
}
function changeSort(field: SortField) {
  const [oldField, direction] = String(filters.value.sort).split(',')
  return setQuery({ ...filters.value, sort: `${field},${oldField === field && direction === 'asc' ? 'desc' : 'asc'}`, page: 0 })
}
let timer: ReturnType<typeof setTimeout> | undefined
watch(() => draft.name, value => {
  clearTimeout(timer)
  if (String(value ?? '').trim() === (filters.value.name ?? '')) {
    searching.value = false
    if (!data.value) void refresh()
    return
  }
  clear() // Сразу отменяем старый HTTP, не ждём окончания debounce.
  searching.value = true
  timer = setTimeout(() => { void apply() }, 300)
})
watch(filters, value => {
  for (const key of Object.keys(draft)) delete draft[key]
  Object.assign(draft, value)
})
onScopeDispose(() => clearTimeout(timer))
watch(error, cause => { if (cause && errorStatus(cause) === 403) void navigateTo('/forbidden') })

async function remove(isu: number) {
  if (!isAdmin.value || busy.value || !window.confirm('Удалить студента?')) return
  deleting.value = true
  actionError.value = null
  try {
    await service.remove(isu)
    if (!data.value?.data.length && (filters.value.page ?? 0) > 0) await setQuery({ ...filters.value, page: filters.value.page! - 1 })
  } catch (cause) { actionError.value = cause as RequestError }
  finally { deleting.value = false }
}
</script>
<template>
  <section>
    <h1>Студенты</h1>
    <NuxtLink v-if="isAdmin" to="/students/new">Добавить студента</NuxtLink>
    <form @submit.prevent="apply">
      <SearchInput :model-value="String(draft.name ?? '')" @update:model-value="draft.name = $event" />
      <StudentFilters :filters="draft" @update:filters="Object.assign(draft, $event)" @apply="apply" @reset="reset" />
      <button :disabled="busy">Найти</button>
    </form>
    <LoadingIndicator :active="busy" />
    <ErrorMessage :error="error || actionError" />
    <button v-if="error" type="button" :disabled="busy" @click="refresh()">Повторить загрузку</button>
    <template v-if="data && !error">
      <p v-if="!busy && !data.data.length">Студенты не найдены.</p>
      <StudentsTable :students="data.data" :is-admin="isAdmin" :pending="busy" @sort="changeSort" @remove="remove" />
      <StudentPagination v-bind="data" :pending="busy" @change="setQuery({ ...filters, page: $event })" @size-change="setQuery({ ...filters, size: $event, page: 0 })" />
    </template>
  </section>
</template>
