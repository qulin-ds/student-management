# Лабораторная №4 — Student Management (Vue 3)

Frontend реализован как SPA на Vue 3 Composition API. Используются Vite, Vue Router, Pinia и RxJS. Backend повторно используется из лабораторной №3.

## Структура

- src/pages — список, карточка, создание, редактирование, вход, регистрация и профиль.
- src/components — таблица, поиск, фильтры, пагинация, форма и общие состояния.
- src/stores — глобальное состояние Pinia для сессии и студентов.
- src/api — HTTP-клиент, авторизация и REST API студентов.
- src/composables/useStudentSearch.js — RxJS-поиск с debounce и отменой запросов.
- src/router — маршруты SPA и проверка ролей.
- Dockerfile, nginx.conf, compose.yaml — сборка и совместный запуск.

## Локальный запуск

Нужны Git и Node.js 24+ с npm. Из корня репозитория:

```powershell
cd "4 lab"
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm.cmd ci
npm.cmd run dev
```

Откройте http://localhost:5173. Vite проксирует /api на API_PROXY_TARGET (по умолчанию http://localhost:8080). Backend лабораторной №3 запускается отдельно по инструкции в ../3 lab/README.md.

Для backend нужны JDK 17, Maven 3.x и работающая локальная PostgreSQL с базой `student_management`. В другом терминале из корня репозитория:

```powershell
cd "3 lab"
if (!(Test-Path .env)) { Copy-Item .env.example .env }
# Отредактируйте .env: реальные DB_* и ADMIN_*, не публикуйте файл.
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

Для новой пустой базы перед запуском задайте `$env:DB_DDL_GENERATION='create-or-extend-tables'`. Для существующей базы оставьте `none` (значение по умолчанию) и при необходимости примените миграцию ниже. Spring сам `.env` не читает: его загружает `start.ps1`. Остановка локальных frontend и backend — `Ctrl+C` в каждом терминале; локальная PostgreSQL продолжает работать как служба.

Сборка frontend: `npm.cmd run build`.

## Авторизация

| Операция | Метод и путь | Результат |
| --- | --- | --- |
| Регистрация | POST /api/auth/register | 201, роль USER и пара JWT |
| Вход | POST /api/auth/login | Пара JWT |
| Обновление | POST /api/auth/refresh | Новая пара JWT, прежний refresh отзывается |
| Выход | POST /api/auth/logout | 204, отзыв refresh-сессии |
| Текущий пользователь | GET /api/auth/me | username и role |

Токены хранятся в sessionStorage: переживают обновление страницы и удаляются при закрытии вкладки. Это хранилище доступно JavaScript, поэтому XSS остаётся риском. Для HttpOnly Secure cookies потребуются изменения backend.

HTTP-клиент использует один общий refresh Promise для параллельных 401, повторяет защищённый запрос не более одного раза и не запускает refresh для auth endpoints. 403 не очищает сессию. При окончательном отказе refresh токены и данные студентов очищаются. При сетевой ошибке восстановления сохранённые токены остаются для повторной попытки.

Регистрация всегда создаёт USER. Роль ADMIN назначается только серверной конфигурацией. Профиль показывает username и role: backend не предоставляет endpoint изменения профиля.

## API студентов

| Операция | Метод и путь | Доступ |
| --- | --- | --- |
| Список и фильтры | POST /api/user/students/search | USER, ADMIN |
| Карточка | GET /api/user/students/{isu} | USER, ADMIN |
| Создание | POST /api/admin/students | ADMIN |
| Редактирование | PUT /api/admin/students/{isu} | ADMIN |
| Удаление | DELETE /api/admin/students/{isu} | ADMIN |

Фильтрация поддерживает ISU, name, group, dormitory, room, is_foreign, checkin_date и note; условия объединяются через AND до пагинации. Пустые значения не отправляются, boolean false сохраняется. Сортировка — field,asc или field,desc; page начинается с нуля. Ответ списка содержит data, page, size, totalElements и totalPages. Ответ карточки обёрнут в data, удаление возвращает 204.

Поиск ФИО запускается при вводе; остальные фильтры — кнопкой «Применить» или «Найти». Текстовые поля используют точное совпадение с учётом регистра, не поиск подстроки. RxJS использует задержку 300 мс через timer внутри switchMap и distinctUntilChanged. Новое значение сразу отменяет предыдущий fetch через AbortController; ошибка отдельного запроса не завершает поток и допускает повтор того же запроса. При уходе со страницы подписка очищается.

## Docker Compose

Нужен Docker Desktop с Compose. Из папки `4 lab` выполните `if (!(Test-Path .env)) { Copy-Item .env.example .env }` и задайте непустой DB_PASSWORD. Существующий `.env` не перезаписывайте. Для создания администратора заполните ADMIN_USERNAME, ADMIN_EMAIL и ADMIN_PASSWORD; оставьте их пустыми, чтобы не создавать ADMIN.

```powershell
docker compose config --quiet
docker compose up --build
```

Сайт доступен на http://localhost:8084. Compose запускает frontend Nginx, Spring Boot backend из 3 lab и отдельную PostgreSQL. Nginx раздаёт dist, возвращает index.html для вложенных SPA-маршрутов и проксирует /api/ на backend:8080 с сохранением префикса.

Обычный docker compose down сохраняет volumes. Не используйте --volumes, если нужно сохранить данные. Не коммитьте заполненный .env — в Git хранится только .env.example.

Остановка и повторный запуск из `4 lab`:

```powershell
docker compose stop
docker compose start
# Либо удалить контейнеры и сеть с сохранением данных и ключей:
docker compose down
# После down:
docker compose up -d --build
```

PostgreSQL Docker хранится в `postgres-data`, JWT-ключи — в `jwt-keys`. Это отдельная база: локальные пользователи и студенты автоматически в неё не переносятся. Backend ждёт `pg_isready`, frontend — успешный HTTP-ответ существующего `/v3/api-docs`. В runtime backend установлен `curl`; это проверка доступности HTTP, а не непрерывная проверка всех операций БД.

`DB_PASSWORD` задаёт пароль PostgreSQL только при создании нового хранилища. Изменение `.env` не меняет пароль уже созданной PostgreSQL: используйте прежний пароль либо отдельно согласованную смену пароля в БД. Не удаляйте volume для исправления пароля. `ADMIN_*` создают нового администратора, но не меняют пароль или роль существующего пользователя с таким именем. Настройки администратора должны оставаться корректными даже при повторном запуске.

## Миграция старой локальной базы

Файл [sql/01-refresh-session-timestamps.sql](sql/01-refresh-session-timestamps.sql) запускается только вручную и не подключён к Compose или старту приложения. Он рассчитан на схему `public`: исправляет `refresh_sessions.expiresat` из `bytea` в `timestamp with time zone` и добавляет отсутствующий `revoked_at`. Сериализованный `bytea` не преобразуется в дату: только при этом старом типе удаляются все refresh-сессии. Потребуется повторный вход; уже выданный access действует до истечения срока. Пользователи и студенты сохраняются. Если оба столбца уже исправлены, данные не удаляются. При неизвестных типах транзакция прерывается.

Остановите все backend, обращающиеся к этой локальной базе. Убедитесь, что подключаетесь к нужному серверу. Команды ниже из `4 lab`, для стандартного локального пользователя `postgres`; при других настройках замените хост, порт, имя пользователя и базы. Нужны `psql`, `pg_dump` и `pg_restore` в PATH; пароль вводится по запросу, не помещайте его в команду.

```powershell
psql -X -h localhost -p 5432 -U postgres -d student_management -c "SELECT current_database(), inet_server_addr(), inet_server_port(); SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name='refresh_sessions' ORDER BY ordinal_position;"
# Выберите новый путь резервной копии, не перезаписывайте прежнюю.
pg_dump -h localhost -p 5432 -U postgres -d student_management -Fc -f student_management-before-lab4.dump
pg_restore --list student_management-before-lab4.dump
# Только после успешного dump, проверки архива и осознанного согласия на сброс старых сессий:
psql -X -h localhost -p 5432 -U postgres -d student_management -v ON_ERROR_STOP=1 -f sql/01-refresh-session-timestamps.sql
```

При ошибке резервного копирования не продолжайте. Храните архив вне Git: он содержит персональные данные и хеши паролей. По возможности проверьте восстановление архива в отдельной базе. Скрипт сам выводит итоговые типы; оба должны быть `timestamp with time zone`. После этого запустите backend и войдите заново. Для уже исправленной локальной базы миграция ничего не удалит. Автоматический откат не предусмотрен: при необходимости восстанавливайте архив в отдельную базу с последующим переключением подключения.

## Ограничения и подготовка к защите

Профиль доступен только для просмотра, токены находятся в `sessionStorage`, Docker-конфигурация рассчитана на учебный HTTP-запуск без TLS. Отдельного health endpoint нет. Краткая памятка: [DEFENSE.md](DEFENSE.md). Файл ТЗ лабораторной №4 в репозитории не найден, поэтому соответствие его отдельным формулировкам вопросов не подтверждено.

Последние правки проанализированы по исходному коду; тесты, сборки, браузер и контейнеры в рамках этой подготовки не запускались по просьбе пользователя. Ранее вручную проверенные сценарии не означают проверку этих новых правок.

## Проверки перед сдачей

```powershell
npm.cmd ci
npm.cmd run build
docker compose config --quiet
docker compose up --build
```

Проверьте прямой reload вложенного URL, регистрацию, вход, восстановление сессии, refresh, logout, роли USER/ADMIN, запрет USER на запись, фильтры включая false, сортировку, пагинацию, 404 карточки, 204 удаления и сетевые ошибки. Контейнерный запуск считается проверенным только после фактического запуска Docker.
