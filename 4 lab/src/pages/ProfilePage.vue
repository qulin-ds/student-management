<script setup>
// Назначение: профиль; вход — сессия auth store, выход — username/role и будущий logout.
// TODO: onMounted получить GET /api/auth/me через stores/auth.js, показать pending/ErrorMessage.
// Ответ только {username,role}, USER/ADMIN; email и endpoint изменения профиля/пароля отсутствуют.
// TODO: Выход auth.logout → POST /api/auth/logout {refreshToken}, затем /login; блокировать повтор.
// Очистить локальную сессию даже при сетевой ошибке, сообщить, что серверный отзыв мог не состояться.
// Проверка: обе роли, 401/refresh, offline, выход и повторный вход.
import LoadingIndicator from '../components/LoadingIndicator.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
</script>

<template>
  <section><h2>Профиль — заготовка</h2><p>Имя и роль ещё не запрашивались.</p>
    <LoadingIndicator :active="false" /><ErrorMessage :error="null" />
    <button disabled type="button">Выйти — заготовка</button></section>
</template>
