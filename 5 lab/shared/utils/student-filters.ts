import type { StudentSearchRequest, StudentSort } from '../types/api'

/** Фильтры URL/формы → канонический DTO поиска. Порядок ключей стабилен для кеша.
 * Пустые поля исчезают, false сохраняется; сервер Java всё равно проверяет запрос сам.
 * Связи: useStudents и страница списка. Проверка: F5, page=0, is_foreign=false, сортировка даты.
 */
export function studentFilters(input: Record<string, unknown>): StudentSearchRequest {
  const result: Record<string, unknown> = {}
  for (const field of ['ISU', 'name', 'group', 'dormitory', 'room', 'checkin_date', 'is_foreign', 'note']) {
    const raw = input[field]
    if (raw === undefined || raw === null || raw === '') continue
    const value = typeof raw === 'string' ? raw.trim() : raw
    if (value === '') continue
    if (['ISU', 'dormitory', 'room'].includes(field)) {
      const number = Number(value)
      if (Number.isInteger(number)) result[field] = number
    } else if (field === 'is_foreign') {
      if ([true, false, 'true', 'false'].includes(value as boolean)) result[field] = value === true || value === 'true'
    } else if (typeof value === 'string') result[field] = value
  }
  const sort = String(input.sort || 'ISU,asc')
  result.sort = /^(ISU|name|group|dormitory|room|checkinDate|isForeign|note)(,(asc|desc))?$/.test(sort) ? sort as StudentSort : 'ISU,asc'
  const page = Number(input.page ?? 0)
  const size = Number(input.size ?? 20)
  result.page = Number.isInteger(page) && page >= 0 ? page : 0
  result.size = Number.isInteger(size) && size >= 1 && size <= 100 ? size : 20
  return result as StudentSearchRequest
}
