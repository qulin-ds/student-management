<!-- Назначение: доступное состояние загрузки. Вход: active от useFetch; выход: статус на странице.
Связи: pages/* и ErrorMessage.vue; перенос из 4 lab/src/components/LoadingIndicator.vue.
TODO: подключить к pending реальных запросов. Проверка: медленная сеть показывает статус, завершение скрывает его. -->
<script setup lang="ts">
defineProps<{ active: boolean }>()
</script>
<template><p v-if="active" role="status" aria-live="polite">Загрузка…</p></template>
