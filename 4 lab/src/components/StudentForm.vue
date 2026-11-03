<script setup>
// Общая форма создания и редактирования студента с клиентской валидацией.
import {reactive,watch} from 'vue'
const props=defineProps({initialStudent:{type:Object,default:null},mode:{type:String,default:'create'},pending:Boolean,errors:{type:Object,default:()=>({})}})
const emit=defineEmits(['submit','cancel']),form=reactive({})
function fill(s={}){Object.assign(form,{ISU:s.ISU??'',name:s.name??'',group:s.group??'',dormitory:s.dormitory??'',room:s.room??'',checkin_date:s.checkin_date??s.checkinDate??'',is_foreign:s.is_foreign??s.isForeign??false,note:s.note??'',validation:{}})}
watch(()=>props.initialStudent,fill,{immediate:true})
function submit(){const d={...form,ISU:Number(form.ISU),dormitory:Number(form.dormitory),room:Number(form.room),name:String(form.name).trim(),group:String(form.group).trim(),note:String(form.note).trim()},e={}
if(!Number.isInteger(d.ISU)||d.ISU<100000||d.ISU>999999)e.ISU='ИСУ 100000–999999'
if(!/^[A-Za-zА-Яа-яЁё]{2,}(?:-[A-Za-zА-Яа-яЁё]{2,})*(?: [A-Za-zА-Яа-яЁё]{2,}(?:-[A-Za-zА-Яа-яЁё]{2,})*){1,2}$/.test(d.name)||d.name.length>60)e.name='Некорректное ФИО'
if(!/^[A-Za-zА-Яа-яЁё][0-9]{4,5}$/.test(d.group))e.group='Формат группы: буква и 4–5 цифр'
if(!Number.isInteger(d.dormitory)||d.dormitory<1||d.dormitory>20)e.dormitory='Общежитие 1–20'
if(!Number.isInteger(d.room)||d.room<1000||d.room>9999)e.room='Комната 1000–9999'
const date=new Date(d.checkin_date);if(!/^\d{4}-\d{2}-\d{2}$/.test(d.checkin_date)||Number.isNaN(date.valueOf())||date.getFullYear()<2016||date>new Date())e.checkin_date='Дата с 2016 года по сегодня'
if(d.note.length>2000)e.note='Не более 2000 символов'
if(Object.keys(e).length){form.validation=e;return}delete d.validation;d.is_foreign=Boolean(form.is_foreign);emit('submit',d)}
</script>
<template><form @submit.prevent="submit">
<label>ИСУ<input v-model="form.ISU" type="number" required :readonly="mode==='edit'"/></label><small>{{errors.ISU||form.validation?.ISU}}</small>
<label>ФИО<input v-model="form.name" maxlength="60" required/></label><small>{{errors.name||form.validation?.name}}</small>
<label>Группа<input v-model="form.group" required/></label><small>{{errors.group||form.validation?.group}}</small>
<label>Общежитие<input v-model="form.dormitory" type="number" min="1" max="20" required/></label><small>{{errors.dormitory||form.validation?.dormitory}}</small>
<label>Комната<input v-model="form.room" type="number" min="1000" max="9999" required/></label><small>{{errors.room||form.validation?.room}}</small>
<label>Дата заселения<input v-model="form.checkin_date" type="date" min="2016-01-01" required/></label><small>{{errors.checkinDate||errors.checkin_date||form.validation?.checkin_date}}</small>
<label><input v-model="form.is_foreign" type="checkbox"/> Иностранец</label><label>Заметка<textarea v-model="form.note" maxlength="2000"/></label><small>{{errors.note||form.validation?.note}}</small>
<button :disabled="pending">Сохранить</button><button type="button" :disabled="pending" @click="$emit('cancel')">Отмена</button></form></template>
