<!-- Назначение: общая навигация; вход — страница через slot и runtimeConfig.
Связи: app.vue, useAuth.ts; переносить навигацию из 4 lab/src/App.vue, RouterLink → NuxtLink.
TODO: показывать меню по реальному user.role, добавить logout с очисткой кеша.
Проверка: меню USER/ADMIN и ширина 360px; сейчас все ссылки ведут к заданиям каркаса. -->
<script setup lang="ts">
const config = useRuntimeConfig()
</script>

<template>
  <header>
    <NuxtLink to="/">Лабораторная №5 · Управление студентами</NuxtLink>
    <nav aria-label="Основная навигация">
      <NuxtLink to="/login">Вход</NuxtLink>
      <NuxtLink to="/register">Регистрация</NuxtLink>
      <NuxtLink to="/students">Студенты</NuxtLink>
      <NuxtLink to="/students/new">Добавление</NuxtLink>
      <NuxtLink to="/profile">Профиль</NuxtLink>
    </nav>
    <p v-if="config.public.labPreview" class="notice" role="status">
      Режим просмотра каркаса: защита страниц отключена, авторизация и API не реализованы.
      Реальные данные не загружаются. Для проверки middleware отключите NUXT_PUBLIC_LAB_PREVIEW.
    </p>
  </header>
  <main id="main"><slot /></main>
</template>
