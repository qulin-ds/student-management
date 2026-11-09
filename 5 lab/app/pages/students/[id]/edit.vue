<!-- Назначение: изменение; SSR GET по id → форма → PUT /api/admin/students/{isu} → data.
Связи: StudentForm, useApi/useStudents; перенос 4 lab/src/pages/StudentEditPage.vue.
TODO: загрузить карточку, запретить менять ISU, передать полный StudentCreateRequest в PUT.
TODO: после успеха очистить кеш карточки и списков; показать ошибки полей без потери ввода.
Проверка: ADMIN сохраняет и видит изменения после F5; 404 записи и 403 роли обрабатываются раздельно. -->
<script setup lang="ts">
definePageMeta({ requiresAuth: true, roles: ['ADMIN'], validate: route => /^\d{6}$/.test(String(route.params.id)) })
</script>
<template>
  <LabTask title="Редактирование студента" source="4 lab/src/pages/StudentEditPage.vue" :tasks="[
    'Загрузить запись при SSR и передать initialStudent в форму.',
    'Отправить PUT с неизменным ISU; PATCH доступен отдельно, его DTO не содержит ISU.',
    'Обновить кеш и перейти к карточке только после успешного ответа.',
  ]"><StudentForm /></LabTask>
</template>
