<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
</script>

<template>
  <main>
    <h1>
      {{
        error.statusCode === 404
          ? '404 — Страница не найдена'
          : `Ошибка ${error.statusCode}`
      }}
    </h1>

    <p>
      {{
        error.statusCode === 404
          ? 'Проверьте адрес страницы или ИСУ студента.'
          : 'Не удалось открыть страницу. Попробуйте ещё раз.'
      }}
    </p>

    <button @click="clearError({ redirect: '/' })">На главную</button>
  </main>
</template>
