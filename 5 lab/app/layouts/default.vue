<!-- Назначение: общая навигация; вход — страница через slot.
Связи: app.vue, useAuth.ts; переносить навигацию из 4 lab/src/App.vue, RouterLink → NuxtLink.
TODO: показывать меню по реальному user.role, добавить logout с очисткой кеша.
Проверка: меню USER/ADMIN и ширина 360px. -->

<template>
  <header>
    <NuxtLink to="/">Управление студентами</NuxtLink>
    <nav aria-label="Основная навигация">
      <NuxtLink to="/login">Вход</NuxtLink>
      <NuxtLink to="/register">Регистрация</NuxtLink>
      <NuxtLink to="/students">Студенты</NuxtLink>
      <NuxtLink to="/students/new">Добавление</NuxtLink>
      <NuxtLink to="/profile">Профиль</NuxtLink>
    </nav>
  </header>
  <main id="main"><slot /></main>
</template>
