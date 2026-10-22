// Назначение: контракт AuthController из 3 lab; вызывается stores/auth.js через http.js.
// Вход/выход каждой операции указан рядом; пока функции отклоняют Promise и не обращаются к сети.
// Роли: register всегда создаёт USER, ADMIN создаётся только backend AdminBootstrap; поле role не посылать.
// Проверка: сопоставить тела/статусы с DTO и ApiIntegrationTest backend; не хранить пароль в store.
import { request } from './http'

export async function login(credentials) {
  // TODO: POST /auth/login {username,password}; username принимает также email.
  // Вернуть {accessToken,refreshToken}; неверные данные → 401, пустые поля → 422.
  throw new Error('Вход — заготовка')
}
export async function register(data) {
  // TODO: POST /auth/register {username,email,password}; 201 → {accessToken,refreshToken}.
  // Пароль: 8..72 символа по DTO и максимум 72 байта UTF-8 по AuthService (важно для кириллицы).
  // 409 — заняты username/email, 422 — валидация; передать ошибку store и форме.
  throw new Error('Регистрация — заготовка')
}
export async function refresh(refreshToken) {
  // TODO: POST /auth/refresh {refreshToken}; вернуть новую пару токенов, старый refresh отозван.
  // Не вызывать автоматический refresh самого refresh-запроса; просроченный токен → 401.
  throw new Error('Обновление сессии — заготовка')
}
export async function logout(refreshToken) {
  // TODO: POST /auth/logout {refreshToken}; 204 без JSON. Операция отзывает refresh, не текущий access.
  throw new Error('Выход — заготовка')
}
export async function me() {
  // TODO: GET /auth/me с Bearer access; вернуть только {username,role}, email/id здесь отсутствуют.
  // Endpoint изменения профиля/пароля в backend отсутствует: не придумывать PUT /auth/me.
  throw new Error('Профиль — заготовка')
}
