<!--
  Назначение: профиль; GET /api/auth/me → useAuth.user → username/role на странице.
  Связи: useAuth.ts, middleware; перенос 4 lab/src/pages/ProfilePage.vue.
  Middleware восстанавливает профиль до SSR; выход доступен в общем меню.
  Проверка: F5 показывает тот же профиль; logout отзывает refresh и удаляет cookie, чужой профиль не появляется.
-->
<script setup lang="ts">
definePageMeta({ requiresAuth: true })

const { user } = useAuth()
</script>

<template>
  <section>
    <h1>Профиль</h1>

    <dl v-if="user">
      <dt>Имя пользователя</dt>
      <dd>{{ user.username }}</dd>

      <dt>Роль</dt>
      <dd>{{ user.role }}</dd>
    </dl>

    <p>Email и редактирование профиля не предоставляются текущим API.</p>
  </section>
</template>
