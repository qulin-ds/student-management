<!-- Назначение: профиль; GET /api/auth/me → useAuth.user → username/role на странице.
Связи: useAuth.ts, middleware; перенос 4 lab/src/pages/ProfilePage.vue.
TODO: восстановление сессии при SSR, профиль и logout с очисткой всех данных пользователя.
Проверка: F5 показывает тот же профиль; logout отзывает refresh и удаляет cookie, чужой профиль не появляется. -->
<script setup lang="ts">
definePageMeta({ requiresAuth: true })
</script>
<template>
  <section>
    <h1>Профиль</h1>
    <p>Раздел пока не подключён.</p>
  </section>
</template>
