<script setup lang="ts">
defineProps<{ active?: boolean }>()
</script>

<template>
  <p v-if="active" role="status" aria-live="polite">Загрузка…</p>
</template>
