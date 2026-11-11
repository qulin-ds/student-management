<!-- Назначение: доступный индикатор ожидания сетевой операции. -->
<script setup lang="ts">
// Страница передаёт pending; компонент объявляет загрузку для screen reader.
defineProps<{ active?: boolean }>()
</script>

<template>
  <p v-if="active" role="status" aria-live="polite">Загрузка…</p>
</template>
