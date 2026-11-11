<!-- Назначение: SSR-карточка; route.params.id — ИСУ → GET /api/user/students/{isu} → ответ.data.
Связи: useStudents.detailKey, useApi, error.vue; перенос 4 lab/src/pages/StudentPage.vue.
useStudentCard ждёт SSR-ответ и обновляется при смене id; только 404 Java означает отсутствие студента.
Действия ADMIN скрыты в интерфейсе, а окончательные права проверяет Java.
Проверка: открыть URL напрямую; неверный формат и отсутствующий ИСУ дают HTTP 404, 401/503 не становятся 404. -->
<script setup lang="ts">
import { errorStatus, type RequestError } from '~~/shared/utils/api-error'
definePageMeta({
  requiresAuth: true,
  roles: ['USER', 'ADMIN'],
  validate: route => /^\d{6}$/.test(String(route.params.id)),
})
const route = useRoute()
const isu = computed(() => Number(route.params.id))
const { user } = useAuth()
const service = useStudents()
const { data: student, pending, error, refresh } = await useStudentCard(isu)
const deleting = ref(false)
const actionError = ref<RequestError | null>(null)
if (error.value && errorStatus(error.value) === 404) throw createError({ statusCode: 404, message: 'Студент не найден' })
// Один компонент может обслуживать несколько ИСУ при клиентской навигации.
watch(error, cause => {
  if (!cause) return
  if (errorStatus(cause) === 404) showError(createError({ statusCode: 404, message: 'Студент не найден' }))
  if (errorStatus(cause) === 403) void navigateTo('/forbidden')
})
async function remove() {
  if (user.value?.role !== 'ADMIN' || deleting.value || !window.confirm('Удалить студента?')) return
  deleting.value = true
  try {
    // Не обновляем удалённую активную карточку: она закономерно вернёт 404.
    await service.api(`/admin/students/${isu.value}`, { method: 'DELETE' })
    clearNuxtData(key => key.startsWith('students:'))
    service.times.value = {}
    await navigateTo('/students')
  } catch (cause) { actionError.value = cause as RequestError }
  finally { deleting.value = false }
}
</script>
<template>
  <section>
    <h1>Карточка студента</h1>
    <LoadingIndicator :active="pending || deleting" />
    <ErrorMessage :error="error || actionError" />
    <button v-if="error" type="button" @click="refresh()">Повторить загрузку</button>
    <dl v-if="student && !error">
      <dt>ИСУ</dt><dd>{{ student.ISU }}</dd><dt>ФИО</dt><dd>{{ student.name }}</dd>
      <dt>Группа</dt><dd>{{ student.group }}</dd><dt>Общежитие</dt><dd>{{ student.dormitory }}</dd>
      <dt>Комната</dt><dd>{{ student.room }}</dd><dt>Дата заселения</dt><dd>{{ student.checkin_date }}</dd>
      <dt>Иностранный студент</dt><dd>{{ student.is_foreign ? 'Да' : 'Нет' }}</dd><dt>Заметка</dt><dd>{{ student.note }}</dd>
    </dl>
    <nav aria-label="Действия со студентом">
      <NuxtLink to="/students">К списку</NuxtLink>
      <template v-if="student && user?.role === 'ADMIN'">
        <NuxtLink :to="`/students/${student.ISU}/edit`">Редактировать</NuxtLink>
        <button :disabled="pending || deleting" @click="remove">Удалить</button>
      </template>
    </nav>
  </section>
</template>
