// Назначение: единственная транспортная граница для api/auth.js и api/students.js.
// Вход: path относительно /api и options (method/body/signal/auth); выход: Promise разобранного JSON,
// undefined для 204; при ошибке — исключение с status/code/message/details.
// TODO: 1. Собрать URL из API_BASE_URL; сериализовать body и Content-Type только при наличии тела.
// TODO: 2. Выполнить fetch с AbortSignal; проверить response.ok, отдельно обработать пустой 204.
// TODO: 3. Прочитать {error:{code,message,status,timestamp,details}} из GlobalExceptionHandler.
// Различать 400 формат, 401 сессия, 403 права, 404 запись, 409 конфликт, 422 поля, 500 сервер;
// сетевой сбой без HTTP-статуса показать как недоступность сервера, AbortError не как ошибку пользователю.
// TODO: 4. Добавлять Authorization: Bearer <accessToken> только в защищённые запросы.
// TODO: 5. На 401 защищённого запроса выполнить ОДИН общий POST /auth/refresh {refreshToken}:
// параллельные запросы ждут один Promise; сохранить ОБА новых токена (backend отзывает старый refresh).
// Повторить исходный запрос только один раз. Не обновлять на 403 и на login/register/refresh/logout.
// При неудаче refresh очистить сессию через stores/auth.js; избежать циклических импортов,
// например передать callbacks получения/обновления токенов из store при инициализации.
// TODO: Проверить JSON/204, offline, 401 одновременно у двух запросов, 403 без refresh, отмену.
// Роли: /user/students — USER/ADMIN, /admin/students — ADMIN, /auth/me — авторизованный.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export async function request(path, options = {}) {
  // TODO: Использовать path/options по шагам выше. Пока намеренно не отправлять запрос и не имитировать успех.
  throw new Error('HTTP-клиент — заготовка')
}
