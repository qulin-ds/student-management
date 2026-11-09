<!-- Назначение: профиль; GET /api/auth/me → useAuth.user → username/role на странице.
Связи: useAuth.ts, middleware; перенос 4 lab/src/pages/ProfilePage.vue.
TODO: восстановление сессии при SSR, профиль и logout с очисткой всех данных пользователя.
Проверка: F5 показывает тот же профиль; logout отзывает refresh и удаляет cookie, чужой профиль не появляется. -->
<script setup lang="ts">
definePageMeta({ requiresAuth: true })
</script>
<template>
  <LabTask title="Профиль пользователя" source="4 lab/src/pages/ProfilePage.vue" :tasks="[
    'Показать username и role из настоящего GET /auth/me.',
    'Добавить выход: Java /auth/logout, удаление cookie, user и кеша студентов.',
    'Не добавлять редактирование профиля и email: текущий me их не предоставляет.',
  ]" />
</template>
