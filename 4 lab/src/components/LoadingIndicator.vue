<script setup>
// Назначение: индикатор ожидания; вход active:Boolean, выход — статус DOM, событий нет.
// TODO: Родитель передаёт pending store/формы; до настоящего запроса загрузку не показывать.
// API/роли задаёт родитель: /api/user/students для USER/ADMIN, /api/auth/login для гостя.
// Проверка: медленная сеть показывает статус; успех/ошибка убирают его. Используется страницами.
defineProps({ active: Boolean })
</script>

<template>
  <p v-if="active" role="status" aria-live="polite">Загрузка…</p>
</template>
