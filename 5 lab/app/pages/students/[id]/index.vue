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
  <section>
    <h1>Карточка студента</h1>
    <p>Раздел пока не подключён.</p>
  </section>
</template>
