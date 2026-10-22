<script setup>
// Назначение: условия списка; вход filters:Object, выход update:filters и reset.
// TODO: Создать локальную копию props, поля ISU/name/group/dormitory/room/is_foreign; emit новую копию.
// Пустое исключать, числа преобразовать в Number, boolean различать null/true/false.
// TODO: checkin_date/note отсутствуют в StudentSearchRequest: фильтрация по всем полям требует
// будущего расширения backend; оставить неподдержанные поля отключёнными, 3 lab не менять.
// TODO: sort: ISU,name,group,dormitory,room,checkinDate,isForeign,note + asc/desc.
// StudentsPage сбрасывает page=0, передаёт RxJS/store → POST /api/user/students/search, USER/ADMIN.
// Проверка: false не теряется; точные фильтры работают вместе (AND), sort и reset сбрасывают страницу.
defineProps({ filters: { type: Object, default: () => ({}) } })
defineEmits(['update:filters', 'reset'])
</script>

<template>
  <fieldset disabled><legend>Фильтры и сортировка — заготовка</legend>
    <!-- TODO: Добавить связанные поля ввода с label и select из комментария к props. -->
    <p>ИСУ · ФИО · Группа · Общежитие · Комната · Иностранец</p>
    <p>Дата заселения и заметка: фильтры API отсутствуют.</p>
    <label>Сортировка <select><option>ИСУ по возрастанию</option></select></label>
    <button disabled type="button">Применить — заготовка</button>
    <button disabled type="button">Сбросить — заготовка</button>
  </fieldset>
</template>
