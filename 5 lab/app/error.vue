<!-- Назначение: общая страница ошибок Nuxt, включая неизвестный URL (HTTP 404).
Вход: NuxtError от маршрутизатора/страницы → безопасное сообщение и возврат домой.
Связи: динамическая карточка и useApi; перенос разметки 4 lab/src/pages/NotFoundPage.vue.
TODO: после подключения Java передавать её 404 через createError, отдельно обрабатывать сетевые ошибки.
Проверка: прямой GET /missing-page и /students/abc дают HTTP 404; сообщение не содержит JWT/stack trace. -->
<script setup lang="ts">
import type { NuxtError } from '#app'
defineProps<{ error: NuxtError }>()
</script>
<template>
  <main>
    <h1>{{ error.statusCode === 404 ? '404 — Страница не найдена' : `Ошибка ${error.statusCode}` }}</h1>
    <p>{{ error.statusCode === 404 ? 'Проверьте адрес страницы или ИСУ студента.' : 'Не удалось открыть страницу. Попробуйте ещё раз.' }}</p>
    <button @click="clearError({ redirect: '/' })">На главную</button>
  </main>
</template>
