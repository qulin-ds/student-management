<!-- Назначение: единое отображение сетевых, API- и validation-ошибок. -->
<script setup lang="ts">
import { computed } from 'vue'

// Компонент принимает нормализованную ошибку useApi или ошибку SSR useAsyncData.
// Проверка: details рядом с сообщением; Nuxt statusCode и обычный status одинаково поддержаны.
const props = defineProps<{ error?: { message?: string; status?: number; statusCode?: number; details?: Record<string, string> | string[] } | null }>()
const status = computed(() => props.error?.status ?? props.error?.statusCode)

const details = computed(() => {
  const value = props.error?.details

  if (!value) {
    return []
  }

  return Array.isArray(value)
    ? value.map((item, index) => [index, item])
    : Object.entries(value)
})
</script>

<template>
  <div v-if="error" role="alert" aria-live="assertive">
    <p>{{ error.message || 'Ошибка операции' }}</p>
    <ul v-if="details.length">
      <li v-for="[key, value] in details" :key="key">
        {{ key }}: {{ value }}
      </li>
    </ul>
    <p v-if="status === 403">Недостаточно прав.</p>
    <p v-else-if="status === 404">Запись не найдена.</p>
    <p v-else-if="!status">Проверьте подключение к серверу.</p>
  </div>
</template>
