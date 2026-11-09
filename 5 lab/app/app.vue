<!-- Назначение: вход Nuxt; layout получает страницу из файлового маршрутизатора.
Связи: layouts/default.vue, pages/*; в 4 lab/src/App.vue здесь был RouterView.
TODO: при необходимости добавить индикатор переходов; данные студентов здесь не загружать.
Проверка: переходы NuxtLink и обновление любой страницы не теряют layout. -->
<template>
  <NuxtLoadingIndicator />
  <NuxtLayout><NuxtPage /></NuxtLayout>
</template>
