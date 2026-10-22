// Назначение: общий список/карточка и метаданные; вход — фильтры/ISU/StudentCreateRequest,
// выход actions — Promise данных api/students.js. Роли USER/ADMIN читают, ADMIN меняет.
// TODO: Подключить страницы через storeToRefs для сохранения реактивности; черновик формы хранить локально.
// Проверка: переключение страниц, 404 карточки, отмена поиска, CRUD без устаревших данных и 403 USER.
import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '../api/students'

export const useStudentsStore = defineStore('students', () => {
  const items = ref([])
  const selected = ref(null)
  // TODO: page с 0; копировать page/size/totalElements/totalPages из PageResponse, не вычислять из items.length.
  const pagination = ref({ page: 0, size: 20, totalElements: 0, totalPages: 0 })
  const pending = ref(false)
  const error = ref(null)

  async function load(filters, signal) {
    // TODO: api.listStudents(filters,signal) → items/pagination; pending/error через try/catch/finally.
    // Защититься от позднего ответа старого запроса (номер запроса/отмена), включая сброс pending.
    throw new Error('Загрузка списка — заготовка')
  }
  async function loadOne(isu) {
    // TODO: Очистить старую selected, api.getStudent(isu) → selected; не показывать прошлую запись при 404.
    throw new Error('Загрузка карточки — заготовка')
  }
  async function create(student) {
    // TODO: api.createStudent(student) → новая запись; обновить список только после успеха.
    throw new Error('Создание — заготовка')
  }
  async function update(isu, student) {
    // TODO: api.updateStudent(isu,student) → selected; перезагрузить текущую страницу списка.
    throw new Error('Редактирование — заготовка')
  }
  async function remove(isu) {
    // TODO: После подтверждения в странице вызвать api.deleteStudent(isu); перезагрузить список.
    // Если удалили последнюю строку последней страницы, уменьшить page; 403/404 не скрывать.
    throw new Error('Удаление — заготовка')
  }
  return { items, selected, pagination, pending, error, load, loadOne, create, update, remove }
})
