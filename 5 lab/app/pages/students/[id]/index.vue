<!-- Назначение: SSR-карточка; route.params.id — ИСУ → GET /api/user/students/{isu} → ответ.data.
Связи: useStudents.detailKey, useApi, error.vue; перенос 4 lab/src/pages/StudentPage.vue.
TODO: await useFetch с реактивным ключом, обновление при смене id; Java 404 → createError({statusCode:404}).
TODO: loading/error/retry, ссылки и удаление ADMIN с инвалидацией кеша.
Проверка: открыть URL напрямую; неверный формат и отсутствующий ИСУ дают HTTP 404, 401/503 не становятся 404. -->
<script setup lang="ts">
definePageMeta({
  requiresAuth: true,
  roles: ['USER', 'ADMIN'],
  validate: route => /^\d{6}$/.test(String(route.params.id)),
})
const route = useRoute()
</script>
<template>
  <LabTask :title="`Карточка студента: ИСУ ${route.params.id}`" source="4 lab/src/pages/StudentPage.vue" :tasks="[
    'Параметр [id] — существующий в Java ISU, отдельного student.id в DTO нет.',
    'Запросить GET /user/students/{isu} при SSR и показать data. Этот маршрут пока не подтверждает существование записи.',
    'Передать 404 Java в error.vue; другие ошибки обработать по статусу.',
  ]" />
</template>
