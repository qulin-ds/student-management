<script setup lang="ts">
// Нумерация страниц API начинается с нуля.
withDefaults(
  defineProps<{
    page?: number
    size?: number
    totalPages?: number
    totalElements?: number
    pending?: boolean
  }>(),
  {
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  },
)

const emit = defineEmits<{
  change: [page: number]
  'size-change': [size: number]
}>()

function changeSize(event: Event) {
  emit('size-change', Number((event.target as HTMLSelectElement).value))
}
</script>

<template>
  <nav v-if="totalPages > 0" aria-label="Пагинация">
    <button :disabled="pending || page <= 0" @click="$emit('change', page - 1)">
      Назад
    </button>

    <span>
      Страница {{ page + 1 }} из {{ totalPages }} · {{ totalElements }} записей
    </span>

    <button
      :disabled="pending || page + 1 >= totalPages"
      @click="$emit('change', page + 1)"
    >
      Далее
    </button>

    <label>
      Размер
      <select :value="size" :disabled="pending" @change="changeSize">
        <option v-for="n in [10, 20, 50, 100]" :key="n" :value="n">
          {{ n }}
        </option>
      </select>
    </label>
  </nav>

  <p v-else>Записей: {{ totalElements }}</p>
</template>
