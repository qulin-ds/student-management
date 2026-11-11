<!-- Назначение: фильтры полей студента и сортировка через v-model:filters. -->
<script setup lang="ts">
import { computed } from 'vue'

// Черновик фильтров приходит от страницы; компонент не мутирует props и не делает HTTP.
// Проверка: is_foreign=false сохраняется, применение/сброс передаются родителю.
const props = defineProps<{ filters: Record<string, unknown> }>()
const emit = defineEmits<{ 'update:filters': [value: Record<string, unknown>]; apply: []; reset: [] }>()
const model = computed({
  get: () => props.filters,
  set: (value) => emit('update:filters', value),
})

function set(key: string, value: unknown) {
  model.value = { ...model.value, [key]: value }
}
function inputValue(event: Event) { return (event.target as HTMLInputElement | HTMLSelectElement).value }
</script>

<template>
  <fieldset>
    <legend>Фильтры</legend>
    <div class="filter-grid">
      <label>
        ИСУ
        <input
          type="number"
          :value="filters.ISU"
          @input="set('ISU', inputValue($event) === '' ? '' : Number(inputValue($event)))"
        />
      </label>
      <label>
        Группа
        <input :value="filters.group" @input="set('group', inputValue($event))" />
      </label>
      <label>
        Общежитие
        <input
          type="number"
          :value="filters.dormitory"
          @input="set('dormitory', inputValue($event) === '' ? '' : Number(inputValue($event)))"
        />
      </label>
      <label>
        Комната
        <input
          type="number"
          :value="filters.room"
          @input="set('room', inputValue($event) === '' ? '' : Number(inputValue($event)))"
        />
      </label>
      <label>
        Дата заселения
        <input
          type="date"
          :value="filters.checkin_date"
          @input="set('checkin_date', inputValue($event))"
        />
      </label>
      <label>
        Иностранец
        <select
          :value="filters.is_foreign == null ? '' : String(filters.is_foreign)"
          @change="
            set(
              'is_foreign',
              inputValue($event) === '' ? null : inputValue($event) === 'true',
            )
          "
        >
          <option value="">Любой</option>
          <option value="true">Да</option>
          <option value="false">Нет</option>
        </select>
      </label>
      <label>
        Заметка
        <input :value="filters.note" @input="set('note', inputValue($event))" />
      </label>
      <label>
        Сортировка
        <select :value="filters.sort" @change="set('sort', inputValue($event))">
          <option
            v-for="field in ['ISU', 'name', 'group', 'dormitory', 'room', 'checkinDate', 'isForeign', 'note']"
            :key="field"
            :value="`${field},asc`"
          >
            {{ field }} ↑
          </option>
          <option
            v-for="field in ['ISU', 'name', 'group', 'dormitory', 'room', 'checkinDate', 'isForeign', 'note']"
            :key="field + '-desc'"
            :value="`${field},desc`"
          >
            {{ field }} ↓
          </option>
        </select>
      </label>
    </div>
    <button type="button" @click="$emit('apply')">Применить</button>
    <button type="button" @click="$emit('reset')">Сбросить</button>
  </fieldset>
</template>
