/** Назначение: ТОЛЬКО транспорт frontend → Java, не второй backend с бизнес-логикой.
 * Вход: /api/backend/auth/*, /user/students/*, /admin/students/*; Java имеет те же пути после /api.
 * Выход сейчас: 501. Источник переноса — 4 lab/src/api/{http,auth,students}.js (список путей, ошибки).
 * Связи: useApi.ts, useAuth.ts, runtimeConfig.javaApiBase; подробный алгоритм в README.
 * TODO 1: ограничить путь И метод таблицей API из README; неизвестное → 404, не создавать открытый proxy.
 * TODO 2: login/register/refresh передавать Java, пару класть в HttpOnly/SameSite=Lax cookies с path=/.
 * TODO 3: me/студенты — cookie access → Authorization: Bearer; не пересылать все cookie/headers Java.
 * TODO 4: возвратить 401/403/404/409/422 Java без замены на 500; сохранить error.details, обработать 204.
 * TODO 5: refresh с ротацией, logout с отзывом в Java и удалением cookie; токены не отдавать в JSON браузеру.
 * TODO 6: для изменяющих запросов проверять Origin и CSRF (cookie-аутентификация), запретить внешние origins.
 * Проверка: реальные USER/ADMIN, logout, истёкший access, Java offline; токены отсутствуют в HTML/payload.
 * Не переносить БД, хеширование, проверку подписи JWT или правила студентов в этот файл.
 */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  throw createError({ statusCode: 501, statusMessage: 'Lab 5 API transport is not implemented' })
})
