<!-- Назначение: объяснение отказа роли; middleware → эта страница → ссылка на список.
Связи: access.global.ts; перенос 4 lab/src/pages/ForbiddenPage.vue.
TODO: при необходимости добавить контекст без персональных данных; 403 API всё равно проверяет Java.
Проверка: USER не может открыть создание/редактирование при выключенном labPreview. -->
<template><section><h1>Недостаточно прав</h1><p>Создание, изменение и удаление доступны только ADMIN.</p><NuxtLink to="/students">К списку</NuxtLink></section></template>
