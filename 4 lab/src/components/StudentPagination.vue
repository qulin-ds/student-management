<script setup>
// Назначение: страницы; будущие props page,size,totalPages,totalElements,pending,
// выход — emits change(page), size-change(size), обрабатываются StudentsPage.
// TODO: Объявить props/emits, UI page+1, API page с 0, size 1..100; не вычислять totals из длины массива.
// TODO: На границах/pending отключать кнопки; для totalPages=0 не показывать «1 из 0».
// API GET /api/user/students для USER/ADMIN, ответ PageResponse.
// Проверка: пусто/одна/последняя страница; size сбрасывает page; вне границ события не отправляются.
// TODO: Добавить defineProps/defineEmits по контракту выше.
</script>

<template>
  <nav aria-label="Пагинация"><button disabled>Назад — заготовка</button>
    <span>Пагинация не подключена</span><button disabled>Далее — заготовка</button></nav>
</template>
