/**
 * Назначение: внешний JSON-контракт Java, общий для приложения и транспорта Nuxt.
 * Данные: DTO из 3 lab → useAuth/useStudents → страницы и компоненты.
 * Связи: AuthController, student/dto, common/error/ApiError; ориентир 4 lab/src/api/*.
 * TODO: сверять изменения с Java, не подменять ISU на id и snake_case на camelCase.
 * Проверка: npm run typecheck и сравнение реального JSON; типы не валидируют сетевой ответ.
 */

export type Role = 'USER' | 'ADMIN'

export interface CurrentUser {
  username: string
  role: Role
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  email: string
}

// Только серверный транспорт должен получать пару; не помещать её в useState/SSR payload.
export interface TokenResponse {
  accessToken: string
  refreshToken: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface StudentDto {
  ISU: number
  name: string
  group: string
  dormitory: number
  room: number
  checkin_date: string
  is_foreign: boolean
  note: string | null
}

export type StudentCreateRequest = Omit<StudentDto, 'note'> & {
  note?: string | null
}

export type StudentUpdateRequest = Partial<Omit<StudentCreateRequest, 'ISU'>>

export type SortField =
  | 'ISU'
  | 'name'
  | 'group'
  | 'dormitory'
  | 'room'
  | 'checkinDate'
  | 'isForeign'
  | 'note'

export type StudentSort = SortField | `${SortField},${'asc' | 'desc'}`

export type StudentSearchRequest = Partial<StudentDto> & {
  sort?: StudentSort
  page?: number
  size?: number
}

export interface PageResponse<T> {
  data: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface DataResponse<T> {
  data: T
}

export interface ApiError {
  code: string
  message: string
  status: number
  timestamp: string
  details: Record<string, string>
}

export interface ApiErrorResponse {
  error: ApiError
}
