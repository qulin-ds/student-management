<script setup>
// Назначение: общая ошибка; вход error:Object|null, выход — текст DOM.
// TODO: Принять {status,code,message,details} из http.js; details показать у полей формы.
// TODO: Различать 400 формат, 401 вход, 403 права, 404 отсутствие, 409 конфликт, 422 поля, offline/500.
// Не выводить JWT/пароли/HTML; добавить emit retry только после подключения родителем.
// API: ошибки /api/auth/* и /api/admin/students (ADMIN), чтение USER/ADMIN.
// Проверка: null ничего не рисует; передать каждую ошибку и проверить доступность role=alert.
defineProps({ error: { type: Object, default: null } })
</script>

<template>
  <p v-if="error" role="alert">{{ error.message || 'Ошибка операции' }}</p>
</template>
