<script setup>
// Назначение: общий черновик; вход initialStudent:Object|null, mode:String, pending:Boolean,
// errors:Object; выход submit(StudentCreateRequest), cancel без аргументов.
// TODO: reactive локальная копия initialStudent, не мутировать prop/store по ссылке.
// TODO: watch initialStudent для асинхронного редактирования; продумать сохранение несохранённого ввода.
// API POST /api/admin/students и PUT /api/admin/students/{isu}, ADMIN; ответ {data:StudentDto}.
// TODO: v-model для ISU,name,group,dormitory,room,checkin_date,is_foreign,note.
// Числа через .number и проверку целого, checkbox boolean; ISU при edit readonly.
// TODO: ISU 100000..999999; name trim и до 60, 2–3 слова латиницы/кириллицы, от 2 букв
// в каждой части, разрешены дефисы (точный regexp см. StudentCreateRequest.java).
// group: буква + 4–5 цифр; dormitory 1..20; room 1000..9999; date YYYY-MM-DD от 2016 до сегодня;
// is_foreign обязателен boolean, false валиден; необязательная note максимум 2000.
// TODO: emit копию только после локальной валидации; 422 details связать с полями:
// Java-ключи checkinDate/isForeign могут отличаться от snake_case input.
// TODO: При pending блокировать submit; при 409/422/offline сохранить ввод и показать errors.
// Проверка: создание/редактирование через один компонент; ISU неизменяем, ошибки у полей, cancel без запроса.
defineProps({
  initialStudent: { type: Object, default: null },
  mode: { type: String, default: 'create' },
  pending: Boolean,
  errors: { type: Object, default: () => ({}) },
})
defineEmits(['submit', 'cancel'])
</script>

<template>
  <form @submit.prevent><fieldset disabled><legend>Форма студента — заготовка</legend>
    <!-- TODO: Добавить v-model, валидацию и сообщения рядом с каждым полем. -->
    <label>ИСУ <input type="number"></label><label>ФИО <input type="text"></label>
    <label>Группа <input type="text"></label><label>Общежитие <input type="number"></label>
    <label>Комната <input type="number"></label><label>Дата заселения <input type="date"></label>
    <label>Иностранец <input type="checkbox"></label><label>Заметка <textarea></textarea></label>
    <button disabled type="submit">Сохранить — заготовка</button>
  </fieldset></form>
</template>
