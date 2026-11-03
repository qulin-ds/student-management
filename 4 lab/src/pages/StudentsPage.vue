<script setup>
// Координирует фильтры, RxJS-поиск, Pinia, таблицу и серверную пагинацию.
import {computed,onMounted,reactive} from 'vue'
import {storeToRefs} from 'pinia'
import {RouterLink} from 'vue-router'
import {useAuthStore} from '../stores/auth'
import {useStudentsStore} from '../stores/students'
import {useStudentSearch} from '../composables/useStudentSearch'
import StudentsTable from '../components/StudentsTable.vue'
import SearchInput from '../components/SearchInput.vue'
import StudentFilters from '../components/StudentFilters.vue'
import StudentPagination from '../components/StudentPagination.vue'
import LoadingIndicator from '../components/LoadingIndicator.vue'
import ErrorMessage from '../components/ErrorMessage.vue'
const store=useStudentsStore(),auth=useAuthStore(),{items,pagination,pending,error}=storeToRefs(store)
const filters=reactive({ISU:'',name:'',group:'',dormitory:'',room:'',checkin_date:'',is_foreign:null,note:'',sort:'ISU,asc',page:0,size:20})
const {query,pending:searching,error:searchError,setQuery}=useStudentSearch((f,s)=>store.load(f,s))
const isAdmin=computed(()=>auth.user?.role==='ADMIN')
function apply(){const f={...filters,name:filters.name.trim(),note:filters.note.trim(),page:0};Object.keys(f).forEach(k=>{if(f[k]===''||f[k]===null)delete f[k]});filters.page=0;setQuery(f)}
function changePage(page){filters.page=page;setQuery({...query.value,page})}
function changeSize(size){filters.size=size;filters.page=0;setQuery({...query.value,size,page:0})}
async function remove(isu){if(!isAdmin.value||!confirm('Удалить студента?'))return;try{await store.remove(isu,query.value)}catch{}}
onMounted(()=>setQuery({page:0,size:20,sort:'ISU,asc'}))
</script>
<template><section><h2>Студенты</h2><RouterLink v-if="isAdmin" to="/students/new">Добавить студента</RouterLink>
<form @submit.prevent="apply"><SearchInput v-model="filters.name"/><StudentFilters :filters="filters" @update:filters="Object.assign(filters,$event)" @apply="apply" @reset="Object.assign(filters,{ISU:'',name:'',group:'',dormitory:'',room:'',checkin_date:'',is_foreign:null,note:'',sort:'ISU,asc',page:0});apply()"/><button>Найти</button></form>
<LoadingIndicator :active="pending||searching"/><ErrorMessage :error="searchError||error"/><p v-if="!pending&&!error&&!items.length">Студенты не найдены.</p>
<StudentsTable :students="items" :is-admin="isAdmin" @remove="remove" @sort="f=>{filters.sort=f+',asc';apply()}"/>
<StudentPagination v-bind="pagination" :pending="pending||searching" @change="changePage" @size-change="changeSize"/></section></template>
