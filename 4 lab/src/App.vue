<script setup>
// Общий каркас SPA: навигация и отображение текущей страницы.
import {RouterLink,RouterView} from 'vue-router'
</script>
<template><header><h1>Управление студентами</h1><nav aria-label="Основная навигация"><RouterLink to="/students">Студенты</RouterLink><RouterLink to="/students/new">Создание</RouterLink><RouterLink to="/login">Вход</RouterLink><RouterLink to="/register">Регистрация</RouterLink><RouterLink to="/profile">Профиль</RouterLink></nav></header><main><RouterView/></main></template>
