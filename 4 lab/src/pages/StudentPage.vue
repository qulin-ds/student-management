<script setup>
// Назначение: карточка; вход prop isu:String из router, выход — поля StudentDto и действия.
// TODO: watch(() => props.isu, ..., {immediate:true}); проверить целое 100000..999999;
// students.loadOne → GET /api/user/students/{isu}, USER/ADMIN, ответ {data:StudentDto}.
// TODO: Показать ISU,name,group,dormitory,room,checkin_date,is_foreign,note, pending/ErrorMessage.
// 404 — студент не найден, 403 — отказ, 401 — через auth; не оставлять старую selected.
// TODO: Удаление ADMIN с подтверждением → DELETE /api/admin/students/{isu}, после 204 → /students.
// Проверка: прямой URL, смена ISU без перемонтирования, 404 и отмена удаления.
import { RouterLink } from 'vue-router'
const props = defineProps({ isu: { type: String, required: true } })
</script>

<template>
  <section><h2>Карточка — заготовка</h2><p>Параметр URL: {{ props.isu }}. Запись не запрашивалась.</p>
    <RouterLink :to="'/students/' + props.isu + '/edit'">Заготовка редактирования</RouterLink>
    <button disabled type="button">Удалить — заготовка</button></section>
</template>
