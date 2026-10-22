<script setup>
// Назначение: таблица; вход students:StudentDto[], выход будущие remove(ISU), sort(field).
// TODO: v-for с key=student.ISU, RouterLink /students/{ISU} и /students/{ISU}/edit.
// Данные GET /api/user/students: ISU,name,group,dormitory,room,checkin_date,is_foreign,note.
// TODO: USER/ADMIN видят карточку; ADMIN видит запись/удаление, роль передать отдельным prop.
// Кнопка удаления emit ISU → StudentsPage подтверждает → store → DELETE /api/admin/students/{isu}.
// Не мутировать props, не убирать строку до успеха, не использовать v-html для заметок/имён.
// Проверка: пустой/полный массив, верный ISU события, отсутствие операций записи у USER.
defineProps({ students: { type: Array, default: () => [] } })
defineEmits(['remove', 'sort'])
</script>

<template>
  <div class="table-scroll"><table><caption>Таблица — заготовка</caption>
    <thead><tr><th>ИСУ</th><th>ФИО</th><th>Группа</th><th>Действия</th></tr></thead>
    <!-- TODO: Различать состояние до загрузки и настоящий пустой ответ сервера. -->
    <tbody><tr><td colspan="4">Данные ещё не запрашивались</td></tr></tbody>
  </table></div>
</template>
