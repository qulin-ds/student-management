# Лабораторная №4 — Student Management (Vue 3)

Frontend реализован как SPA на Vue 3 Composition API. Используются Vite, Vue Router, Pinia и RxJS. Backend повторно используется из лабораторной №3.

## Структура

- src/pages — страницы списка, карточки, создания и редактирования.
- src/components — таблица, поиск, фильтры, пагинация, форма и состояния интерфейса.
- src/stores — глобальное состояние Pinia.
- src/api — общий HTTP-клиент и методы REST API.
- src/composables/useStudentSearch.js — RxJS-поиск с debounce и отменой устаревших запросов.
- src/router — маршруты SPA.
- Dockerfile, nginx.conf, compose.yaml — сборка и совместный запуск.

## Локальный запуск

Нужны Git и Node.js 24+ с npm. Из корня репозитория:

```powershell
cd "4 lab"
Copy-Item .env.example .env
npm.cmd ci
npm.cmd run dev
```

Откройте http://localhost:5173. Vite проксирует /api на API_PROXY_TARGET (по умолчанию http://localhost:8080). Backend лабораторной №3 запускается отдельно по инструкции в ../3 lab/README.md.

Сборка frontend:

```powershell
npm.cmd run build
npm.cmd run preview
```

## Контракт API

Все браузерные запросы проходят через src/api/http.js. Префикс API — /api.

| Операция | Метод и путь | Доступ |
| --- | --- | --- |
| Список и фильтры | POST /api/user/students/search | USER, ADMIN |
| Карточка | GET /api/user/students/{isu} | USER, ADMIN |
| Создание | POST /api/admin/students | ADMIN |
| Редактирование | PUT /api/admin/students/{isu} | ADMIN |
| Удаление | DELETE /api/admin/students/{isu} | ADMIN |

Поиск поддерживает точное совпадение по ISU, name, group, dormitory, room, is_foreign, checkin_date и note; условия объединяются через AND. Пустые значения не отправляются, boolean false сохраняется. Сортировка — field,asc или field,desc; page начинается с нуля, size от 1 до 100. Ответ списка содержит data, page, size, totalElements и totalPages. Ответ карточки обёрнут в data, удаление возвращает 204 без тела.

HTTP-клиент нормализует ошибки с status, code, message и details. При 401 защищённого запроса предусмотрено общее обновление refresh-токена и однократный повтор; 403 не запускает refresh. Проверка ролей на сервере обязательна: скрытие кнопок на клиенте не заменяет Spring Security.

## Docker Compose

Нужен Docker Desktop с Compose. Из папки 4 lab создайте .env из .env.example и задайте непустой DB_PASSWORD. Для создания администратора заполните ADMIN_USERNAME, ADMIN_EMAIL и ADMIN_PASSWORD; оставьте их пустыми, чтобы не создавать ADMIN.

```powershell
docker compose config --quiet
docker compose up --build
```

Сайт доступен на http://localhost:8084. Compose запускает frontend Nginx, Spring Boot backend из 3 lab и отдельную PostgreSQL. Nginx раздаёт dist, возвращает index.html для вложенных SPA-маршрутов и проксирует /api/ на backend:8080 с сохранением префикса. PostgreSQL и JWT-ключи сохраняются в именованных volumes.

Фоновый запуск: docker compose up --build -d. Остановка: docker compose down. Обычный down сохраняет volumes; не используйте --volumes, если нужно сохранить данные. Не коммитьте заполненный .env — в Git хранится только .env.example.

## Проверки перед сдачей

```powershell
npm.cmd ci
npm.cmd run build
docker compose config --quiet
docker compose up --build
```

Проверьте прямое обновление вложенного URL, API через Nginx, роли USER/ADMIN, запрет USER на запись, фильтры, сортировку, пагинацию, 404 карточки, 204 удаления и сетевые ошибки. Контейнерный запуск считается проверенным только после фактического запуска Docker.

## Безопасность

Переменные VITE_* доступны в браузерной сборке: не помещайте туда пароли, секреты JWT и credentials базы. Токены не должны попадать в логи. Авторитетная проверка доступа выполняется backend лабораторной №3.
