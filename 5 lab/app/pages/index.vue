<!-- Назначение: входной URL ведёт к списку студентов, как в 4 lab/src/router/index.js.
Связи: students/index.vue и access.global.ts; данных не получает.
Проверка: / → /students, для гостя далее /login. -->
<script setup lang="ts">
await navigateTo('/students', { replace: true })
</script>
<template><div /></template>
