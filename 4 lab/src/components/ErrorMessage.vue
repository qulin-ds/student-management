<script setup>
// Выводит нормализованные ошибки API и подробности валидации.
defineProps({error:{type:Object,default:null}})
</script>
<template><div v-if="error" role="alert"><p>{{error.message||'Ошибка операции'}}</p><ul v-if="error.details"><li v-for="(v,k) in error.details" :key="k">{{k}}: {{v}}</li></ul><p v-if="error.status===403">Недостаточно прав.</p><p v-else-if="error.status===404">Запись не найдена.</p><p v-else-if="!error.status">Проверьте подключение к серверу.</p></div></template>
