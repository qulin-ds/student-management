<!--
  Назначение: общая навигация; вход — страница через slot.
  Связи: app.vue, useAuth.ts; переносить навигацию из 4 lab/src/App.vue, RouterLink → NuxtLink.
  Пользователь берётся из useAuth после middleware; выход очищает сессию и кеш.
  Проверка: меню USER/ADMIN и ширина 360px.
-->
<script setup lang="ts">
const auth = useAuth()
const { user, pending } = auth
const route = useRoute()
const logoutError = ref('')

async function logout() {
  logoutError.value = ''

  try {
    await auth.logout()
  } catch {
    logoutError.value =
      'Сессия в браузере завершена, но сервер не подтвердил отзыв токена.'
  } finally {
    await navigateTo(
      {
        path: '/login',
        query: logoutError.value ? { reason: 'logout-network' } : {},
      },
      { replace: true },
    )
  }
}

// Если API окончательно вернул 401, убираем защищённый экран и возвращаем на вход.
watch(user, (current, previous) => {
  if (!current && previous && route.meta.requiresAuth) {
    navigateTo({
      path: '/login',
      query: { redirect: route.fullPath },
    })
  }
})
</script>

<template>
  <header>
    <NuxtLink to="/">Управление студентами</NuxtLink>

    <nav aria-label="Основная навигация">
      <template v-if="user">
        <NuxtLink to="/students">Студенты</NuxtLink>
        <NuxtLink v-if="user.role === 'ADMIN'" to="/students/new">
          Добавление
        </NuxtLink>
        <NuxtLink to="/profile">{{ user.username }} · {{ user.role }}</NuxtLink>
        <button type="button" :disabled="pending" @click="logout">
          Выйти
        </button>
      </template>

      <template v-else>
        <NuxtLink to="/login">Вход</NuxtLink>
        <NuxtLink to="/register">Регистрация</NuxtLink>
      </template>
    </nav>

    <p v-if="logoutError" role="alert">{{ logoutError }}</p>
  </header>

  <main id="main">
    <slot />
  </main>
</template>
