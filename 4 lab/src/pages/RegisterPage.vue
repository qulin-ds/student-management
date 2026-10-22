<script setup>
// Назначение: Регистрация; вход — локальные username,email,password, выход — auth.register и переход.
// TODO: Создать reactive/ref черновик и ошибки, stores/auth.js подключить через storeToRefs.
// TODO: Валидировать перед submit: username [A-Za-z0-9_]{3,50}, email до 254, password 8..72 символа;
// дополнительно TextEncoder().encode(password).length <= 72: AuthService ограничивает байты UTF-8.
// 409 — занятый username/email. Всегда создаётся USER, выбора ADMIN нет.
// POST /api/auth/register → {accessToken,refreshToken}; затем GET /api/auth/me → {username,role}.
// TODO: handleSubmit вызывает store; только после успеха перейти /students; ошибки передать ErrorMessage.
// TODO: pending исключает повторную отправку, finally снимает блокировку; пароль не хранить в store.
// Проверка: неправильные поля, 401/409/422/offline, двойной submit, успешный переход.
import ErrorMessage from '../components/ErrorMessage.vue'
import LoadingIndicator from '../components/LoadingIndicator.vue'
// TODO: Добавить handleSubmit рядом с черновиком; до подключения форма отключена.
</script>

<template>
  <section><h2>Регистрация — заготовка</h2><form @submit.prevent><fieldset disabled>
    <label>username <input type="text"></label>
    <label>email <input type="email"></label>
    <label>password <input type="password"></label>
    <button disabled type="submit">Регистрация — заготовка</button>
  </fieldset></form><LoadingIndicator :active="false" /><ErrorMessage :error="null" /></section>
</template>
