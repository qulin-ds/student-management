<!-- Назначение: SSR-список; фильтры URL → POST /api/user/students/search → PageResponse → компоненты.
Связи: useStudents.ts, useApi.ts, StudentFilters/StudentsTable/StudentPagination.
Перенос: 4 lab/src/pages/StudentsPage.vue; первый onMounted заменить await useFetch/useAsyncData.
TODO: канонические фильтры в query, ключ с username и всеми фильтрами, debounce и отмена запросов.
TODO: после DELETE обновить кеш и скорректировать page; 401/403 не превращать в пустой список.
Проверка: view-source содержит реальные строки после реализации, F5 сохраняет фильтры, page=0 — первая страница. -->
<script setup lang="ts">
definePageMeta({ requiresAuth: true, roles: ['USER', 'ADMIN'] })
</script>
<template>
  <section>
    <h1>Студенты</h1>
    <p>Раздел пока не подключён.</p>
  </section>
</template>
