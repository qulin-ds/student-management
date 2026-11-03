<script setup>
// Доступный индикатор ожидания сетевой операции.
defineProps({active:Boolean})
</script>
<template><p v-if="active" role="status" aria-live="polite">Загрузка…</p></template>
