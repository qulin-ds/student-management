<!-- Назначение: регистрация; форма → useAuth.register → POST /api/auth/register в Java.
Связи: useAuth.ts, shared/types/api.ts; перенос 4 lab/src/pages/RegisterPage.vue.
Подтверждение пароля проверяется в браузере и не отправляется Java; role назначает backend.
Проверка: 409 для занятого email, 422 для полей, после успеха реальный пользователь USER и F5. -->
<script setup lang="ts">
import { requestError, type RequestError } from '~~/shared/utils/api-error'
definePageMeta({ guestOnly: true })
const auth = useAuth()
const { pending } = auth
const form = reactive({ username: '', email: '', password: '', confirmPassword: '' })
const error = ref<RequestError | null>(null)
async function submit() {
  if (pending.value) return
  error.value = null
  if (form.password !== form.confirmPassword || form.password.length < 8 || form.password.length > 72 || new TextEncoder().encode(form.password).length > 72) {
    error.value = requestError(422, { message: 'Пароли должны совпадать: 8–72 символа, не более 72 байт UTF-8.' })
    return
  }
  try {
    await auth.register({ username: form.username.trim(), email: form.email.trim(), password: form.password })
    form.password = form.confirmPassword = ''
    await navigateTo('/students', { replace: true })
  } catch (cause) { error.value = cause as RequestError }
}
</script>
<template>
  <section>
    <h1>Регистрация</h1>
    <form @submit.prevent="submit">
      <label>Имя пользователя<input v-model.trim="form.username" pattern="[A-Za-z0-9_]{3,50}" autocomplete="username" required /></label>
      <label>Email<input v-model.trim="form.email" type="email" maxlength="254" autocomplete="email" required /></label>
      <label>Пароль<input v-model="form.password" type="password" minlength="8" maxlength="72" autocomplete="new-password" required /></label>
      <label>Повторите пароль<input v-model="form.confirmPassword" type="password" autocomplete="new-password" required /></label>
      <button :disabled="pending">Зарегистрироваться</button>
    </form>
    <LoadingIndicator :active="pending" />
    <ErrorMessage :error="error" />
    <NuxtLink to="/login">Войти</NuxtLink>
  </section>
</template>
