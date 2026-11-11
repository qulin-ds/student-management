<!-- Назначение: вход Nuxt; layout получает страницу из файлового маршрутизатора.
Связи: layouts/default.vue, pages/*; в 4 lab/src/App.vue здесь был RouterView.
Индикатор переходов встроен в Nuxt; данные студентов загружаются на страницах, не здесь.
Проверка: переходы NuxtLink и обновление любой страницы не теряют layout. -->
<template>
  <NuxtLoadingIndicator />
  <NuxtLayout><NuxtPage /></NuxtLayout>
</template>
