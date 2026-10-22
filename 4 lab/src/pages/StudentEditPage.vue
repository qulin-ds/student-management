<script setup>
// Назначение: редактирование; вход isu из router, выход — сохранение и переход.
// TODO: Подключить stores/students.js и auth.js; доступ ADMIN после реализации guards.
// TODO: watch isu immediate → GET /api/user/students/{isu}; selected передать initialStudent. 404 не открывает пустую форму.
// TODO: @submit(body) → students.update(isu,body) → PUT /api/admin/students/{isu}.
// Тело ISU,name,group,dormitory,room,checkin_date,is_foreign,note → ответ {data:StudentDto}.
// ISU неизменяем; PATCH альтернатива без ISU, null означает пропуск поля.
// TODO: После успеха /students/{ISU}; pending/error.details → StudentForm, общая ошибка → ErrorMessage.
// TODO: @cancel → /students без запроса; не допускать повторный submit.
// Проверка: валидное тело, 403 USER, 409/422 с сохранением ввода, offline, успешный переход.
import StudentForm from '../components/StudentForm.vue'
defineProps({ isu: { type: String, required: true } })
</script>

<template>
  <section><h2>Редактирование — заготовка</h2><StudentForm mode="edit" /></section>
</template>
