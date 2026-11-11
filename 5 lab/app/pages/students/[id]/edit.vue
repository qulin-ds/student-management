<!-- Назначение: SSR-загрузка студента и сохранение изменений через Java API. -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  ApiError,
  DataResponse,
  StudentCreateRequest,
  StudentDto,
} from '~~/shared/types/api'

interface OperationError {
  message: string
  status: number
  details: Record<string, string>
}

definePageMeta({
  requiresAuth: true,
  roles: ['ADMIN'],
  validate: route => /^\d{6}$/.test(String(route.params.id)),
})

const route = useRoute()
const api = useApi()
const students = useStudents()
const pending = ref(false)
const error = ref<OperationError | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const isu = computed(() => Number(route.params.id))
const requestKey = computed(() => `student-edit:${String(route.params.id)}`)

// Загружает исходную запись на сервере, чтобы форма была заполнена до гидратации.
const {
  data: initialStudent,
  error: loadError,
  pending: loading,
} = await useAsyncData<StudentDto>(
  requestKey,
  async () => {
    const response = await api<DataResponse<StudentDto>>(
      `/user/students/${route.params.id}`,
    )
    return response.data
  },
  {
    watch: [() => route.params.id],
  },
)

// Преобразует ошибку загрузки в HTTP-ошибку Nuxt, сохраняя исходный статус Java.
if (loadError.value) {
  const source = loadError.value as {
    data?: { error?: ApiError }
    statusCode?: number
    statusMessage?: string
    message?: string
  }
  const apiError = source.data?.error

  throw createError({
    statusCode: apiError?.status ?? source.statusCode ?? (source as { status?: number }).status ?? 503,
    statusMessage:
      apiError?.message ??
      source.statusMessage ??
      source.message ??
      'Не удалось загрузить данные студента',
  })
}

if (!initialStudent.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Студент не найден',
  })
}

// Приводит ошибку PUT к формату общего компонента ErrorMessage.
function normalizeError(
  value: unknown,
  fallbackMessage = 'Не удалось загрузить данные студента.',
): OperationError {
  const source = value as {
    data?: { error?: ApiError }
    statusCode?: number
    statusMessage?: string
    message?: string
  }
  const apiError = source.data?.error

  return {
    message:
      apiError?.message ??
      source.statusMessage ??
      source.message ??
      'Не удалось сохранить изменения. Повторите попытку.',
    status: apiError?.status ?? source.statusCode ?? (source as { status?: number }).status ?? 0,
    details: apiError?.details ?? (source as { details?: Record<string, string> }).details ?? {},
  }
}

// Отправляет полный DTO; ИСУ берётся из URL и не может быть изменён формой.
async function updateStudent(payload: StudentCreateRequest) {
  if (pending.value) {
    return
  }

  pending.value = true
  error.value = null
  fieldErrors.value = {}

  try {
    const request: StudentCreateRequest = {
      ...payload,
      ISU: isu.value,
    }

    await api<DataResponse<StudentDto>>(`/admin/students/${isu.value}`, {
      method: 'PUT',
      body: request,
    })

    // Ошибка незавершённого кеша не должна отменять уже успешное изменение.
    await students.invalidate().catch((cause: unknown) => {
      console.warn('Не удалось обновить кеш студентов:', cause)
    })

    await navigateTo(`/students/${isu.value}`)
  } catch (cause) {
    error.value = normalizeError(
      cause,
      'Не удалось сохранить изменения. Повторите попытку.',
    )
    fieldErrors.value = error.value.details
  } finally {
    pending.value = false
  }
}

// Возвращает к карточке без сохранения изменений.
function cancelEditing() {
  return navigateTo(`/students/${isu.value}`)
}
</script>

<template>
  <section>
    <h1>Редактирование студента</h1>

    <LoadingIndicator :active="loading" />
    <ErrorMessage :error="error" />

    <StudentForm
      v-if="initialStudent"
      mode="edit"
      :initial-student="initialStudent"
      :pending="pending"
      :errors="fieldErrors"
      @submit="updateStudent"
      @cancel="cancelEditing"
    />
  </section>
</template>
