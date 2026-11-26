<script setup lang="ts">
definePageMeta({ requiresAuth: true })

const { user } = useAuth()
</script>

<template>
  <section>
    <h1>Профиль</h1>

    <dl v-if="user">
      <dt>Имя пользователя</dt>
      <dd>{{ user.username }}</dd>

      <dt>Роль</dt>
      <dd>{{ user.role }}</dd>
    </dl>

    <p>Email и редактирование профиля не предоставляются текущим API.</p>
  </section>
</template>
