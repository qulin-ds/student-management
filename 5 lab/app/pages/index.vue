<!-- Назначение: карта работы; вход — статические инструкции, выход — ссылки на страницы.
Связи: README и pages/*; в 4 lab корень перенаправлял на /students.
TODO: после выполнения лабораторной заменить карту переходом к списку.
Проверка: HTML с заголовком приходит с сервера даже без JavaScript. -->
<template>
  <section>
    <h1>Перенос Vue → Nuxt: каркас лабораторной №5</h1>
    <p>Начните с README.md, затем реализуйте транспорт JWT и useAuth.ts. Здесь нет тестовых студентов или фиктивной сессии.</p>
    <ol>
      <li><NuxtLink to="/login">Вход</NuxtLink> и <NuxtLink to="/register">регистрация</NuxtLink></li>
      <li><NuxtLink to="/students">Список, поиск, фильтры, сортировка и пагинация</NuxtLink></li>
      <li><NuxtLink to="/students/100000">Динамическая страница [id]</NuxtLink> — только маршрут, не существующая запись</li>
      <li><NuxtLink to="/students/new">Создание</NuxtLink> и <NuxtLink to="/students/100000/edit">редактирование</NuxtLink></li>
      <li><NuxtLink to="/profile">Профиль</NuxtLink> и <NuxtLink to="/forbidden">отказ в доступе</NuxtLink></li>
      <li><NuxtLink to="/missing-page">Проверить 404</NuxtLink></li>
    </ol>
  </section>
</template>
