// API студентов: список, карточка и CRUD через общий HTTP-клиент.
import {request} from './http'
export async function listStudents(filters={},signal){const body=Object.fromEntries(Object.entries(filters).filter(([,v])=>v!==''&&v!==null&&v!==undefined));return request('/user/students/search',{method:'POST',body,signal})}
export async function getStudent(isu){return (await request('/user/students/'+encodeURIComponent(isu)))?.data}
export async function createStudent(student){return (await request('/admin/students',{method:'POST',body:student}))?.data}
export async function updateStudent(isu,student){return (await request('/admin/students/'+encodeURIComponent(isu),{method:'PUT',body:student}))?.data}
export async function deleteStudent(isu){return request('/admin/students/'+encodeURIComponent(isu),{method:'DELETE'})}
