<script setup lang="ts">
// Назначение: общая типизированная форма создания и редактирования студента.
import { reactive, watch } from 'vue'
import type { StudentCreateRequest, StudentDto } from '~~/shared/types/api'

type FormMode = 'create' | 'edit'
type FieldName = keyof StudentCreateRequest
type FormErrors = Partial<Record<FieldName, string>>

interface Props {
  initialStudent?: StudentDto | null
  mode?: FormMode
  pending?: boolean
  errors?: Record<string, string>
}

interface FormState {
  ISU: string
  name: string
  group: string
  dormitory: string
  room: string
  checkin_date: string
  is_foreign: boolean
  note: string
}

const props = withDefaults(defineProps<Props>(), {
  initialStudent: null,
  mode: 'create',
  pending: false,
  errors: () => ({}),
})

const emit = defineEmits<{
  submit: [payload: StudentCreateRequest]
  cancel: []
}>()

const form = reactive<FormState>({
  ISU: '',
  name: '',
  group: '',
  dormitory: '',
  room: '',
  checkin_date: '',
  is_foreign: false,
  note: '',
})

const validationErrors = reactive<FormErrors>({})

// Заполняет черновик при открытии редактирования или смене исходной записи.
function fillForm(student: StudentDto | null = null) {
  form.ISU = student?.ISU == null ? '' : String(student.ISU)
  form.name = student?.name ?? ''
  form.group = student?.group ?? ''
  form.dormitory = student?.dormitory == null ? '' : String(student.dormitory)
  form.room = student?.room == null ? '' : String(student.room)
  form.checkin_date = student?.checkin_date ?? ''
  form.is_foreign = student?.is_foreign ?? false
  form.note = student?.note ?? ''

  Object.keys(validationErrors).forEach((key) => {
    delete validationErrors[key as FieldName]
  })
}

watch(() => props.initialStudent, fillForm, { immediate: true })

// Возвращает сообщение для поля: сначала ошибка Java, затем локальная проверка.
function fieldError(field: FieldName): string {
  const alias = field === 'checkin_date' ? 'checkinDate' : field === 'is_foreign' ? 'isForeign' : field

  return props.errors[field] ?? props.errors[alias] ?? validationErrors[field] ?? ''
}

// Проверяет дату без зависимости от часового пояса браузера.
function isValidCheckinDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day

  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  return isRealDate && value >= '2016-01-01' && value <= today
}

// Проверяет поля и формирует полный DTO, который ожидает POST и PUT в Java.
function validateForm(): StudentCreateRequest | null {
  const payload: StudentCreateRequest = {
    ISU: Number(form.ISU),
    name: form.name.trim(),
    group: form.group.trim(),
    dormitory: Number(form.dormitory),
    room: Number(form.room),
    checkin_date: form.checkin_date,
    is_foreign: form.is_foreign,
    note: form.note.trim() || null,
  }

  const nextErrors: FormErrors = {}

  if (!/^\d{6}$/.test(form.ISU) || !Number.isInteger(payload.ISU)) {
    nextErrors.ISU = 'Введите шестизначный ИСУ'
  }

  const fullNamePattern =
    /^[A-Za-zА-Яа-яЁё]{2,}(?:-[A-Za-zА-Яа-яЁё]{2,})*(?: [A-Za-zА-Яа-яЁё]{2,}(?:-[A-Za-zА-Яа-яЁё]{2,})*){1,2}$/

  if (!fullNamePattern.test(payload.name) || payload.name.length > 60) {
    nextErrors.name = 'Введите корректные фамилию и имя, при необходимости отчество'
  }

  if (!/^[A-Za-zА-Яа-яЁё][0-9]{4,5}$/.test(payload.group)) {
    nextErrors.group = 'Формат группы: буква и 4–5 цифр'
  }

  if (!/^\d+$/.test(form.dormitory) || payload.dormitory < 1 || payload.dormitory > 20) {
    nextErrors.dormitory = 'Номер общежития должен быть от 1 до 20'
  }

  if (!/^\d{4}$/.test(form.room) || payload.room < 1000 || payload.room > 9999) {
    nextErrors.room = 'Номер комнаты должен содержать четыре цифры'
  }

  if (!isValidCheckinDate(form.checkin_date)) {
    nextErrors.checkin_date = 'Укажите реальную дату с 01.01.2016 по сегодняшний день'
  }

  if (payload.note && payload.note.length > 2000) {
    nextErrors.note = 'Заметка не должна превышать 2000 символов'
  }

  Object.keys(validationErrors).forEach((key) => {
    delete validationErrors[key as FieldName]
  })
  Object.assign(validationErrors, nextErrors)

  return Object.keys(nextErrors).length === 0 ? payload : null
}

// Отправляет данные родительской странице только после локальной проверки.
function submitForm() {
  if (props.pending) {
    return
  }

  const payload = validateForm()

  if (payload) {
    emit('submit', payload)
  }
}
</script>

<template>
  <form class="student-form" @submit.prevent="submitForm">
    <label>
      ИСУ
      <input
        v-model="form.ISU"
        type="text"
        inputmode="numeric"
        maxlength="6"
        autocomplete="off"
        required
        :readonly="mode === 'edit'"
        :aria-invalid="Boolean(fieldError('ISU'))"
      />
      <small v-if="fieldError('ISU')" role="alert">{{ fieldError('ISU') }}</small>
    </label>

    <label>
      ФИО
      <input
        v-model.trim="form.name"
        type="text"
        maxlength="60"
        autocomplete="name"
        required
        :aria-invalid="Boolean(fieldError('name'))"
      />
      <small v-if="fieldError('name')" role="alert">{{ fieldError('name') }}</small>
    </label>

    <label>
      Группа
      <input
        v-model.trim="form.group"
        type="text"
        maxlength="6"
        required
        :aria-invalid="Boolean(fieldError('group'))"
      />
      <small v-if="fieldError('group')" role="alert">{{ fieldError('group') }}</small>
    </label>

    <label>
      Общежитие
      <input
        v-model="form.dormitory"
        type="text"
        inputmode="numeric"
        maxlength="2"
        required
        :aria-invalid="Boolean(fieldError('dormitory'))"
      />
      <small v-if="fieldError('dormitory')" role="alert">
        {{ fieldError('dormitory') }}
      </small>
    </label>

    <label>
      Комната
      <input
        v-model="form.room"
        type="text"
        inputmode="numeric"
        maxlength="4"
        required
        :aria-invalid="Boolean(fieldError('room'))"
      />
      <small v-if="fieldError('room')" role="alert">{{ fieldError('room') }}</small>
    </label>

    <label>
      Дата заселения
      <input
        v-model="form.checkin_date"
        type="date"
        min="2016-01-01"
        required
        :aria-invalid="Boolean(fieldError('checkin_date'))"
      />
      <small v-if="fieldError('checkin_date')" role="alert">
        {{ fieldError('checkin_date') }}
      </small>
    </label>

    <label class="checkbox-field">
      <input v-model="form.is_foreign" type="checkbox" />
      Иностранный студент
    </label>

    <label>
      Заметка
      <textarea
        v-model="form.note"
        maxlength="2000"
        rows="4"
        :aria-invalid="Boolean(fieldError('note'))"
      />
      <small v-if="fieldError('note')" role="alert">{{ fieldError('note') }}</small>
    </label>

    <div class="student-form__actions">
      <button type="submit" :disabled="pending">
        {{ pending ? 'Сохранение…' : 'Сохранить' }}
      </button>
      <button type="button" :disabled="pending" @click="emit('cancel')">
        Отмена
      </button>
    </div>
  </form>
</template>
