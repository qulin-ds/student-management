import type { StudentSearchRequest } from '~~/shared/types/api'

/** Назначение: будущие запросы списка/карточки и обновление кеша после CRUD.
 * Данные: фильтры страницы → Java через useApi → PageResponse/StudentDto → компоненты.
 * Связи: pages/students/*, shared/types/api.ts; перенос из 4 lab/src/api/students.js и stores/students.js.
 * TODO: добавить useFetch/useAsyncData для чтения, $fetch для CRUD; не загружать первый список в onMounted.
 * TODO: debounce 300ms и отмена старого запроса из useStudentSearch.js; RxJS пока не требуется.
 * Проверка: исходный HTML содержит данные после реализации; смена фильтра/page меняет ключ, CRUD обновляет список.
 */
export function useStudents() {
  const { user } = useAuth()
  function listKey(filters: StudentSearchRequest) {
    // TODO: перед вызовом убрать пустые поля и задать одинаковый порядок свойств.
    return `students:${user.value?.username ?? 'guest'}:list:${JSON.stringify(filters)}`
  }
  function detailKey(isu: number) {
    return `students:${user.value?.username ?? 'guest'}:detail:${isu}`
  }
  async function invalidate() {
    // TODO: после УСПЕШНОГО CRUD очистить все варианты фильтров и карточек, затем обновить активный запрос.
    // clearNuxtData(key => key.startsWith('students:'))
    // await refreshNuxtData(activeKey)
    // При удалении последней записи страницы уменьшить page и повторить поиск.
    throw new Error('Обновление кеша ещё не реализовано')
  }
  return { listKey, detailKey, invalidate }
}
