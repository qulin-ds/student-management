<script setup>
// Назначение: Вход; вход — локальные username,password, выход — auth.login и переход.
// TODO: Создать reactive/ref черновик и ошибки, stores/auth.js подключить через storeToRefs.
// TODO: Валидировать перед submit: username принимает email; непустые поля обязательны, неверная пара → 401.
// POST /api/auth/login → {accessToken,refreshToken}; затем GET /api/auth/me → {username,role}.
// TODO: handleSubmit вызывает store; только после успеха перейти /students; ошибки передать ErrorMessage.
// TODO: pending исключает повторную отправку, finally снимает блокировку; пароль не хранить в store.
// Проверка: неправильные поля, 401/409/422/offline, двойной submit, успешный переход.
import ErrorMessage from '../components/ErrorMessage.vue'
import LoadingIndicator from '../components/LoadingIndicator.vue'
// TODO: Добавить handleSubmit рядом с черновиком; до подключения форма отключена.
</script>

<template>
  <section><h2>Вход — заготовка</h2><form @submit.prevent><fieldset disabled>
    <label>username <input type="text"></label>
    <label>password <input type="password"></label>
    <button disabled type="submit">Вход — заготовка</button>
  </fieldset></form><LoadingIndicator :active="false" /><ErrorMessage :error="null" /></section>
</template>
