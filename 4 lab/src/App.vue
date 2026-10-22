<script setup>
// Назначение: общий каркас; вход — текущий маршрут, выход — навигация и RouterView.
// TODO: Подключить stores/auth.js; показывать username из GET /api/auth/me.
// TODO: Для USER оставить просмотр, для ADMIN добавить управление; пока все ссылки открывают заготовки.
// TODO: Добавить выход через auth.logout, pending и ErrorMessage; POST /api/auth/logout получает refreshToken.
// Проверка: открыть каждый пункт меню; после реализации проверить меню обеих ролей и выход.
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <h1>Управление студентами · Vue</h1>
    <nav aria-label="Основная навигация">
      <RouterLink to="/students">Студенты</RouterLink>
      <RouterLink to="/students/new">Создание</RouterLink>
      <RouterLink to="/login">Вход</RouterLink>
      <RouterLink to="/register">Регистрация</RouterLink>
      <RouterLink to="/profile">Профиль</RouterLink>
    </nav>
  </header>
  <main>
    <p class="notice">Учебный каркас: работают только переходы. Данные не загружаются, операции отключены.</p>
    <!-- TODO: После подключения guards отображать отказ в доступе отдельно от неизвестного маршрута. -->
    <RouterView />
  </main>
</template>
