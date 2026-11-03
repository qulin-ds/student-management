<script setup>
// Таблица студентов с переходом в карточку и действиями администратора.
import {RouterLink} from 'vue-router'
defineProps({students:{type:Array,default:()=>[]},isAdmin:Boolean})
defineEmits(['remove','sort'])
</script>
<template><div class="table-scroll"><table><thead><tr><th><button @click="$emit('sort','ISU')">ИСУ</button></th><th><button @click="$emit('sort','name')">ФИО</button></th><th>Группа</th><th>Общежитие</th><th>Комната</th><th>Дата</th><th>Иностранец</th><th>Заметка</th><th>Действия</th></tr></thead><tbody>
<tr v-for="s in students" :key="s.ISU"><td>{{s.ISU}}</td><td>{{s.name}}</td><td>{{s.group}}</td><td>{{s.dormitory}}</td><td>{{s.room}}</td><td>{{s.checkin_date}}</td><td>{{s.is_foreign?'Да':'Нет'}}</td><td>{{s.note}}</td><td><RouterLink :to="`/students/${s.ISU}`">Открыть</RouterLink><template v-if="isAdmin"> · <RouterLink :to="`/students/${s.ISU}/edit`">Изменить</RouterLink> <button @click="$emit('remove',s.ISU)">Удалить</button></template></td></tr>
</tbody></table></div></template>
