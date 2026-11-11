<!-- Назначение: вход; форма → useAuth.login → Nuxt-транспорт → Java /api/auth/login.
Связи: useAuth.ts, ErrorMessage.vue, middleware; перенос 4 lab/src/pages/LoginPage.vue.
TODO: перенести форму username/password, ошибки, pending и безопасный внутренний redirect.
Проверка: неверный пароль не создаёт сессию, успешный вход переживает F5, токен недоступен document.cookie. -->
<script setup lang="ts">
definePageMeta({ guestOnly: true })
</script>
<template>
  <section>
    <h1>Вход</h1>
    <p>Раздел пока не подключён.</p>
  </section>
</template>
