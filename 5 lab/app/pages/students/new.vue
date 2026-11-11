<!-- Назначение: создание студента через Java API и переход к созданной карточке. -->
<script setup lang="ts">
import { ref } from 'vue'
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
})

const api = useApi()
const students = useStudents()
const pending = ref(false)
const error = ref<OperationError | null>(null)
const fieldErrors = ref<Record<string, string>>({})

// Приводит ошибку Nuxt или Java к формату общего компонента ErrorMessage.
function normalizeError(value: unknown): OperationError {
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
      'Не удалось создать студента. Повторите попытку.',
    status: apiError?.status ?? source.statusCode ?? 0,
    details: apiError?.details ?? {},
  }
}

// Создаёт студента и открывает его карточку только после ответа 201.
async function createStudent(payload: StudentCreateRequest) {
  if (pending.value) {
    return
  }

  pending.value = true
  error.value = null
  fieldErrors.value = {}

  try {
    const response = await api<DataResponse<StudentDto>>('/admin/students', {
      method: 'POST',
      body: payload,
    })

    if (!response.data || !Number.isInteger(response.data.ISU)) {
      throw new Error('Сервер не вернул ИСУ созданного студента')
    }

    // Ошибка незавершённого кеша не должна отменять уже успешное создание.
    await students.invalidate().catch((cause: unknown) => {
      console.warn('Не удалось обновить кеш студентов:', cause)
    })

    await navigateTo(`/students/${response.data.ISU}`)
  } catch (cause) {
    error.value = normalizeError(cause)
    fieldErrors.value = error.value.details
  } finally {
    pending.value = false
  }
}

// Возвращает пользователя к списку без отправки данных.
function cancelCreation() {
  return navigateTo('/students')
}
</script>

<template>
  <section>
    <h1>Добавление студента</h1>

    <ErrorMessage :error="error" />
    <LoadingIndicator :active="pending" />

    <StudentForm
      mode="create"
      :pending="pending"
      :errors="fieldErrors"
      @submit="createStudent"
      @cancel="cancelCreation"
    />
  </section>
</template>
