<!-- Назначение: вход; форма → useAuth.login → Nuxt-транспорт → Java /api/auth/login.
Связи: useAuth.ts, ErrorMessage.vue, middleware; перенос 4 lab/src/pages/LoginPage.vue.
Форма хранит пароль только локально; после входа переходит на безопасный внутренний URL.
Проверка: неверный пароль не создаёт сессию, успешный вход переживает F5, токен недоступен document.cookie. -->
<script setup lang="ts">
import type { RequestError } from '~~/shared/utils/api-error'
definePageMeta({ guestOnly: true })
const auth = useAuth()
const { pending } = auth
const route = useRoute()
const form = reactive({ username: '', password: '' })
const error = ref<RequestError | null>(null)
async function submit() {
  if (pending.value) return
  error.value = null
  try {
    await auth.login({ username: form.username.trim(), password: form.password })
    form.password = ''
    await navigateTo(loginDestination(route.query.redirect), { replace: true })
  } catch (cause) { error.value = cause as RequestError }
}
</script>
<template>
  <section>
    <h1>Вход</h1>
    <form @submit.prevent="submit">
      <label>Имя пользователя или email<input v-model.trim="form.username" autocomplete="username" required /></label>
      <label>Пароль<input v-model="form.password" type="password" autocomplete="current-password" required /></label>
      <button :disabled="pending">Войти</button>
    </form>
    <LoadingIndicator :active="pending" />
    <ErrorMessage :error="error" />
    <p>Нет аккаунта? <NuxtLink to="/register">Зарегистрироваться</NuxtLink></p>
  </section>
</template>
