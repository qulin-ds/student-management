// Назначение: контракт StudentController/DTO; вход — фильтры, ISU или тело студента; выход ниже.
// TODO: Вызывать request из http.js; не использовать старый /api/requests и метод QUERY из 1-2 lab.
// Роли: чтение USER/ADMIN, запись ADMIN. Проверка: 201, 204, 404, 409, 422 и запрет записи USER.
import { request } from './http'

export async function listStudents(filters, signal) {
  // TODO: POST /user/students/search с JSON {ISU,name,group,dormitory,room,is_foreign,sort,page,size}.
  // Альтернатива GET /user/students с query (is_foreign поддерживается явно).
  // Пустые фильтры исключать, false не терять. Совпадение всех шести полей ТОЧНОЕ (AND).
  // Ответ {data:StudentDto[],page,size,totalElements,totalPages}; page с 0, size 1..100 (default 20).
  // sort: одно поле + ",asc"/",desc"; поля ISU,name,group,dormitory,room,checkinDate,isForeign,note.
  // Нет q, поиска подстроки, фильтров checkin_date/note. Не отправлять неизвестные поля:
  // фильтрация по ВСЕМ полям потребует будущего расширения backend; локальная фильтрация одной
  // страницы не является глобальным поиском. В этой работе 3 lab не менять.
  // Передать signal для отмены устаревшего RxJS-запроса; вернуть PageResponse без потери метаданных.
  throw new Error('Список студентов — заготовка')
}
export async function getStudent(isu) {
  // TODO: GET /user/students/{isu}; {data:StudentDto} → вернуть data; 404 передать странице.
  throw new Error('Карточка студента — заготовка')
}
export async function createStudent(student) {
  // TODO: POST /admin/students; 201 {data:StudentDto} → data.
  // Тело: ISU,name,group,dormitory,room,checkin_date,is_foreign,note. Числа/boolean — не строки.
  throw new Error('Создание студента — заготовка')
}
export async function updateStudent(isu, student) {
  // TODO: PUT /admin/students/{isu} с ПОЛНЫМ StudentCreateRequest, ISU равен isu пути и неизменяем.
  // Либо PATCH того же URL только изменёнными полями БЕЗ ISU (StudentUpdateRequest).
  // Оба возвращают {data:StudentDto}. null у PATCH означает «оставить», note очищать строкой "".
  throw new Error('Редактирование студента — заготовка')
}
export async function deleteStudent(isu) {
  // TODO: DELETE /admin/students/{isu}; 204 без JSON → undefined. 404 — уже отсутствует.
  throw new Error('Удаление студента — заготовка')
}
