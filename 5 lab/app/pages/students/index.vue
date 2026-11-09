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
  <LabTask title="Список студентов" source="4 lab/src/pages/StudentsPage.vue" :tasks="[
    'Загрузить первый список при SSR через Nuxt-транспорт; сейчас запросы не выполняются.',
    'Перенести поиск и фильтры. Java ищет точное совпадение name, без подстроки.',
    'Реализовать sort, page (с нуля), size (1–100), loading/error/empty и повтор.',
    'Удаление только ADMIN; после успеха обновить все варианты кеша списка.',
  ]">
    <StudentFilters />
    <StudentsTable />
    <StudentPagination />
  </LabTask>
</template>
