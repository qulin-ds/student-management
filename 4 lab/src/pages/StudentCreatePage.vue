<script setup>
// Назначение: создание; вход черновик StudentForm, выход — сохранение и переход.
// TODO: Подключить stores/students.js и auth.js; доступ ADMIN после реализации guards.
// TODO: Передать новый пустой черновик StudentForm; не использовать старую selected.
// TODO: @submit(body) → students.create(body) → POST /api/admin/students.
// Тело ISU,name,group,dormitory,room,checkin_date,is_foreign,note → ответ {data:StudentDto}.
// 409 означает занятый ISU, не переходить до успешного 201.
// TODO: После успеха /students/{ISU}; pending/error.details → StudentForm, общая ошибка → ErrorMessage.
// TODO: @cancel → /students без запроса; не допускать повторный submit.
// Проверка: валидное тело, 403 USER, 409/422 с сохранением ввода, offline, успешный переход.
import StudentForm from '../components/StudentForm.vue'

</script>

<template>
  <section><h2>Создание — заготовка</h2><StudentForm mode="create" /></section>
</template>
