<!-- Назначение: создание; StudentForm → POST /api/admin/students → data.ISU → карточка.
Связи: StudentForm.vue, useApi/useStudents; перенос 4 lab/src/pages/StudentCreatePage.vue.
TODO: форма, pending, error.details, инвалидация после успеха и navigateTo карточки.
Проверка: ADMIN создаёт запись, USER получает 403 от Java даже при прямом HTTP-запросе. -->
<script setup lang="ts">
definePageMeta({ requiresAuth: true, roles: ['ADMIN'] })
</script>
<template>
  <LabTask title="Добавление студента" source="4 lab/src/pages/StudentCreatePage.vue" :tasks="[
    'Подключить StudentForm и отправку StudentCreateRequest через Nuxt-транспорт.',
    'Показать ошибки 409/422; после 201 очистить кеш списка и перейти к data.ISU.',
  ]"><StudentForm /></LabTask>
</template>
