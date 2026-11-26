<script setup lang="ts">
withDefaults(defineProps<{ modelValue?: string }>(), { modelValue: '' })

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function input(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
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
