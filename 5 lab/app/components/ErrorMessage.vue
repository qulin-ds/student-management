<!-- Назначение: ошибка запроса без утечки токенов. Вход: безопасный message, выход: alert и retry.
Связи: useApi.ts, pages/*; перенос из 4 lab/src/components/ErrorMessage.vue.
TODO: подключить error.error.message и details Java через нормализацию транспорта.
Проверка: 422 показывает поля формы, 503 даёт повторить запрос; сырой JWT никогда не отображается. -->
<script setup lang="ts">
defineProps<{ message?: string }>()
defineEmits<{ retry: [] }>()
</script>
<template>
  <div v-if="message" role="alert"><p>{{ message }}</p><button @click="$emit('retry')">Повторить</button></div>
</template>
