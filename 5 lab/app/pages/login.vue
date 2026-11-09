<!-- Назначение: вход; форма → useAuth.login → Nuxt-транспорт → Java /api/auth/login.
Связи: useAuth.ts, ErrorMessage.vue, middleware; перенос 4 lab/src/pages/LoginPage.vue.
TODO: перенести форму username/password, ошибки, pending и безопасный внутренний redirect.
Проверка: неверный пароль не создаёт сессию, успешный вход переживает F5, токен недоступен document.cookie. -->
<script setup lang="ts">
definePageMeta({ guestOnly: true })
</script>
<template>
  <LabTask title="Вход" source="4 lab/src/pages/LoginPage.vue" :tasks="[
    'Добавить форму username (имя или email) и password, не сохранять пароль в SSR-состоянии.',
    'Реализовать транспорт HttpOnly-cookie и useAuth.login; после входа запросить me.',
    'Показать pending, 401 и сетевые ошибки; безопасно обработать query.redirect.',
  ]" />
</template>
