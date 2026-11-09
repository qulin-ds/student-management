<!-- Назначение: регистрация; форма → useAuth.register → POST /api/auth/register в Java.
Связи: useAuth.ts, shared/types/api.ts; перенос 4 lab/src/pages/RegisterPage.vue.
TODO: поля username/email/password/confirmPassword; последнее не отправлять Java, role тоже не отправлять.
Проверка: 409 для занятого email, 422 для полей, после успеха реальный пользователь USER и F5. -->
<script setup lang="ts">
definePageMeta({ guestOnly: true })
</script>
<template>
  <LabTask title="Регистрация" source="4 lab/src/pages/RegisterPage.vue" :tasks="[
    'Перенести форму и проверку совпадения паролей. Username: 3–50 латинских букв, цифр и _.',
    'Email до 254 символов; пароль 8–72 символа и не более 72 байт UTF-8.',
    'Передать только RegisterRequest, получить cookie через транспорт, затем me.',
  ]" />
</template>
