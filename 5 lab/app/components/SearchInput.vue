<script setup lang="ts">
// Контролируемое поле поиска по точному ФИО.
// Только ввод: значение приходит от страницы, новое значение уходит через v-model.
// Проверка: ввод обновляет фильтр name; задержкой и отменой HTTP управляет страница.
withDefaults(defineProps<{ modelValue?: string }>(), { modelValue: '' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
function input(event: Event) { emit('update:modelValue', (event.target as HTMLInputElement).value) }
</script>

<template>
  <label>
    ФИО
    <input
      type="search"
      :value="modelValue"
      placeholder="Точное совпадение"
      @input="input"
    />
  </label>
</template>
