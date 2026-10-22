<script setup>
// Назначение: ввод поиска; вход modelValue:String, выход update:modelValue со строкой.
// TODO: Убрать disabled после подключения StudentsPage/useStudentSearch; emit event.target.value.
// Не мутировать prop; debounce должен находиться в RxJS composable, не дублироваться здесь.
// API: POST /api/user/students/search, name — точное ФИО, USER/ADMIN; параметра q нет.
// Проверка: ввод/очистка передаются родителю; повторные запросы проверять в composable.
defineProps({ modelValue: { type: String, default: '' } })
defineEmits(['update:modelValue'])
</script>

<template>
  <label>Поиск по точному ФИО — заготовка
    <!-- TODO: Связать value/input с props/emits после подключения потока поиска. -->
    <input disabled type="search" :value="modelValue" placeholder="Поиск не подключён">
  </label>
</template>
