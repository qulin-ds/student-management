<!-- Назначение: изменение; SSR GET по id → форма → PUT /api/admin/students/{isu} → data.
Связи: StudentForm, useApi/useStudents; перенос 4 lab/src/pages/StudentEditPage.vue.
TODO: загрузить карточку, запретить менять ISU, передать полный StudentCreateRequest в PUT.
TODO: после успеха очистить кеш карточки и списков; показать ошибки полей без потери ввода.
Проверка: ADMIN сохраняет и видит изменения после F5; 404 записи и 403 роли обрабатываются раздельно. -->
<script setup lang="ts">
definePageMeta({ requiresAuth: true, roles: ['ADMIN'], validate: route => /^\d{6}$/.test(String(route.params.id)) })
</script>
<template>
  <section>
    <h1>Редактирование студента</h1>
    <p>Раздел пока не подключён.</p>
  </section>
</template>
