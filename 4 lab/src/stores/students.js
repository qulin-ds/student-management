// Pinia-хранилище списка студентов, карточки, пагинации и CRUD.
import {ref} from 'vue'
import {defineStore} from 'pinia'
import * as api from '../api/students'
export const useStudentsStore=defineStore('students',()=>{
 const items=ref([]),selected=ref(null),pending=ref(false),error=ref(null),pagination=ref({page:0,size:20,totalElements:0,totalPages:0});let latest=0
 async function load(filters={},signal){const id=++latest;pending.value=true;error.value=null;try{const r=await api.listStudents(filters,signal);if(id===latest){items.value=r.data||[];pagination.value={page:r.page??0,size:r.size??20,totalElements:r.totalElements??0,totalPages:r.totalPages??0}}return r}catch(e){if(id===latest&&e.name!=='AbortError')error.value=e;throw e}finally{if(id===latest)pending.value=false}}
 async function loadOne(isu){selected.value=null;pending.value=true;error.value=null;try{return selected.value=await api.getStudent(isu)}catch(e){error.value=e;throw e}finally{pending.value=false}}
 async function create(s){pending.value=true;error.value=null;try{return await api.createStudent(s)}catch(e){error.value=e;throw e}finally{pending.value=false}}
 async function update(isu,s){pending.value=true;error.value=null;try{return selected.value=await api.updateStudent(isu,s)}catch(e){error.value=e;throw e}finally{pending.value=false}}
 async function remove(isu,filters={}){pending.value=true;error.value=null;try{await api.deleteStudent(isu);const page=items.value.length===1&&pagination.value.page>0?pagination.value.page-1:pagination.value.page;return await load({...filters,page,size:pagination.value.size})}catch(e){error.value=e;throw e}finally{pending.value=false}}
 function clear(){items.value=[];selected.value=null;pagination.value={page:0,size:20,totalElements:0,totalPages:0}}
 return{items,selected,pending,error,pagination,load,loadOne,create,update,remove,clear}
})
