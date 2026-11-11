<script setup lang="ts">
// Таблица студентов с переходом в карточку и действиями администратора.
import type { SortField, StudentDto } from '~~/shared/types/api'

// Страница передаёт DTO и роль; таблица только отображает их и сообщает о действиях.
// Проверка: USER не видит действий записи; ссылки используют именно ISU.
withDefaults(
  defineProps<{
    students?: StudentDto[]
    isAdmin?: boolean
    pending?: boolean
  }>(),
  {
    students: () => [],
  },
)

defineEmits<{
  remove: [isu: number]
  sort: [field: SortField]
}>()
</script>

<template>
  <div class="table-scroll">
    <table>
      <thead>
        <tr>
          <th>
            <button @click="$emit('sort', 'ISU')">ИСУ</button>
          </th>
          <th>
            <button @click="$emit('sort', 'name')">ФИО</button>
          </th>
          <th>Группа</th>
          <th>Общежитие</th>
          <th>Комната</th>
          <th>Дата</th>
          <th>Иностранец</th>
          <th>Заметка</th>
          <th>Действия</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="student in students" :key="student.ISU">
          <td>{{ student.ISU }}</td>
          <td>{{ student.name }}</td>
          <td>{{ student.group }}</td>
          <td>{{ student.dormitory }}</td>
          <td>{{ student.room }}</td>
          <td>{{ student.checkin_date }}</td>
          <td>{{ student.is_foreign ? 'Да' : 'Нет' }}</td>
          <td>{{ student.note }}</td>
          <td>
            <NuxtLink :to="`/students/${student.ISU}`">Открыть</NuxtLink>

            <template v-if="isAdmin">
              ·
              <NuxtLink :to="`/students/${student.ISU}/edit`">
                Изменить
              </NuxtLink>
              <button
                :disabled="pending"
                @click="$emit('remove', student.ISU)"
              >
                Удалить
              </button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
