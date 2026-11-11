<!-- Назначение: создание; StudentForm → POST /api/admin/students → data.ISU → карточка.
Связи: StudentForm.vue, useApi/useStudents; перенос 4 lab/src/pages/StudentCreatePage.vue.
TODO: форма, pending, error.details, инвалидация после успеха и navigateTo карточки.
Проверка: ADMIN создаёт запись, USER получает 403 от Java даже при прямом HTTP-запросе. -->
<script setup lang="ts">
definePageMeta({ requiresAuth: true, roles: ['ADMIN'] })
</script>
<template>
  <section>
    <h1>Добавление студента</h1>
    <p>Раздел пока не подключён.</p>
  </section>
</template>
