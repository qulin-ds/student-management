// Назначение: глобальная сессия Pinia; страницы передают credentials, получают Promise результата.
// TODO: Использовать api/auth.js, а не fetch внутри компонентов. USER/ADMIN брать из GET /auth/me.
// Проверка: login/register → me, refresh с заменой пары, выход, повторный вход, перезагрузка, 401/403.
import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '../api/auth'

export const useAuthStore = defineStore('auth', () => {
  // TODO: user = {username,role} или null; accessToken/refreshToken — строки или null.
  // Выбрать и описать в коде стратегию хранения: память теряется при reload, browser storage доступен XSS.
  // Backend отдаёт JWT в JSON, HttpOnly-cookie endpoint отсутствует. Секреты подписи JWT не нужны frontend.
  const user = ref(null)
  const accessToken = ref(null)
  const refreshToken = ref(null)
  // TODO: pending защищает от повторного submit; error хранит нормализованную ошибку без паролей/токенов.
  const pending = ref(false)
  const error = ref(null)

  async function login(credentials) {
    // TODO: Сбросить error; установить pending; вызвать authApi.login; сохранить оба JWT;
    // получить authApi.me; в catch сохранить и пробросить ошибку; в finally снять pending.
    throw new Error('Действие входа — заготовка')
  }
  async function register(data) {
    // TODO: Аналогично login через authApi.register({username,email,password}); не отправлять role.
    throw new Error('Действие регистрации — заготовка')
  }
  async function restoreSession() {
    // TODO: Восстановить выбранное хранилище, refresh при необходимости, затем me.
    // Координировать с http.js один Promise refresh; не считать декодированный JWT проверкой подписи.
    throw new Error('Восстановление сессии — заготовка')
  }
  async function logout() {
    // TODO: authApi.logout(refreshToken); в finally очистить user/оба токена и students store.
    // Сетевую ошибку сообщить: локальный выход не гарантирует отзыв refresh на сервере.
    throw new Error('Действие выхода — заготовка')
  }
  return { user, accessToken, refreshToken, pending, error, login, register, restoreSession, logout }
})
