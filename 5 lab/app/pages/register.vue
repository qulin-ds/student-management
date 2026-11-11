<!-- Назначение: регистрация; форма → useAuth.register → POST /api/auth/register в Java.
Связи: useAuth.ts, shared/types/api.ts; перенос 4 lab/src/pages/RegisterPage.vue.
TODO: поля username/email/password/confirmPassword; последнее не отправлять Java, role тоже не отправлять.
Проверка: 409 для занятого email, 422 для полей, после успеха реальный пользователь USER и F5. -->
<script setup lang="ts">
definePageMeta({ guestOnly: true })
</script>
<template>
  <section>
    <h1>Регистрация</h1>
    <p>Раздел пока не подключён.</p>
  </section>
</template>
