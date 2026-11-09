# Лабораторная №5: перенос Vue frontend на Nuxt

Это запускаемый **учебный каркас**, а не готовая лабораторная. Страницы объясняют следующий шаг; настоящие вход, данные студентов и CRUD ещё не подключены. Начните с этого README, затем с `server/api/backend/[...path].ts` и `app/composables/useAuth.ts`. В каждом исходном файле есть русские комментарии и конкретные TODO.

## Что найдено в репозитории

- `3 lab`: Java 17, Spring Boot 3.3.4, Spring Security, JWT (jjwt 0.12.6), JPA с EclipseLink 4.0.4, PostgreSQL. Контракт проверен по `AuthController`, `StudentController`, DTO, `SecurityConfig`, `AuthService`, `StudentService`, `GlobalExceptionHandler` и `application.yml`.
- `4 lab`: Vue 3.5, Vue Router 4.5, Pinia 3, RxJS 7.8, Vite 7. Страницы входа/регистрации/профиля, списка/карточки/создания/редактирования, 403/404; общие форма, таблица, фильтры, пагинация и состояния загрузки/ошибок. Изучены `src/api/*`, stores, router, composable поиска, страницы, компоненты и стили. Маршрут карточки `/students/:isu` **уже есть** в четвёртой лабораторной; здесь он становится файловым SSR-маршрутом `[id]`.
- В четвёртой работе JWT лежат в **sessionStorage**, не localStorage. `http.js` добавляет Bearer, обновляет токены после 401, повторяет запрос один раз; refresh объединяется в одну Promise в пределах SPA. `auth.js` восстанавливает пользователя через `/auth/me`, а router.beforeEach проверяет роли. Первое получение студентов происходит в `onMounted`, что необходимо заменить для SSR.
- В доступном дереве репозитория `AGENTS.md` не найден. Третья и четвёртая работы не изменяются. Пятая находится в `5 lab`, как соседняя `4 lab`.

### Реальные маршруты Java

Префикс всех строк ниже — `/api`. Префикс **нового транспорта Nuxt** — `/api/backend`: например, браузер вызывает `/api/backend/auth/me`, а транспорт должен вызвать Java `/api/auth/me`. Новых Java endpoint здесь нет.

| Метод и путь Java после `/api` | Доступ | Тело и результат |
| --- | --- | --- |
| POST `/auth/register` | без входа | `{ username, email, password }` → 201 `{ accessToken, refreshToken }`; роль всегда USER |
| POST `/auth/login` | без входа | `{ username, password }` → пара токенов; username допускает также email |
| POST `/auth/refresh` | без access | `{ refreshToken }` → новая пара; предыдущая refresh-сессия отзывается |
| POST `/auth/logout` | без access | `{ refreshToken }` → 204; отзыв refresh в Java |
| GET `/auth/me` | авторизован | `{ username, role }`, без обёртки data |
| POST `/user/students/search` | USER, ADMIN | StudentSearchRequest → PageResponse |
| GET `/user/students` | USER, ADMIN | альтернативный поиск через query → PageResponse |
| GET `/user/students/{isu}` | USER, ADMIN | `{ data: StudentDto }` |
| POST `/admin/students` | ADMIN | StudentCreateRequest → 201 `{ data: StudentDto }` |
| PUT `/admin/students/{isu}` | ADMIN | полный StudentCreateRequest, включая неизменный ISU → `{ data: StudentDto }` |
| PATCH `/admin/students/{isu}` | ADMIN | StudentUpdateRequest (без ISU) → `{ data: StudentDto }` |
| DELETE `/admin/students/{isu}` | ADMIN | 204, без JSON |

Профиль предоставляет **только username и role**. Endpoint редактирования профиля, email в `/me`, загрузка аватара и выдача роли админа через frontend отсутствуют. Не придумывайте их. ADMIN настраивается на стороне Java. USER/ADMIN — значения JSON; Spring внутри использует соответствующие authorities с ROLE_.

### DTO и особенности данных

Типы уже записаны в `shared/types/api.ts`:

- StudentDto: `ISU`, `name`, `group`, `dormitory`, `room`, `checkin_date`, `is_foreign`, `note`. `ISU` — ключ, отдельного `id` нет. В `/students/[id]` параметр `id` означает **шестизначный ИСУ**.
- StudentCreateRequest: те же поля, note может отсутствовать. ИСУ 100000–999999, ФИО до 60 символов (фамилия и имя, необязательное отчество, буквы/дефисы), группа — буква и 4–5 цифр, общежитие 1–20, комната 1000–9999, note до 2000 символов. Дата `YYYY-MM-DD`, не раньше 2016 года и не в будущем. Авторитетные ограничения остаются в Java.
- StudentUpdateRequest: необязательные поля создания **кроме ISU**; Java PATCH трактует null как «сохранить старое», очистить note можно пустой строкой.
- StudentSearchRequest: необязательные поля студента плюс `sort`, `page`, `size`. Удаляйте пустые строки/null/undefined, но сохраняйте `false`. Поиск текстовых полей в StudentService — **точное совпадение**, не подстрока. Изменение этого поведения требует отдельного решения на Java и не входит в каркас.
- `sort`: `ISU`, `name`, `group`, `dormitory`, `room`, `checkinDate`, `isForeign`, `note`, необязательное направление `,asc`/`,desc`. Здесь используются **camelCase**, несмотря на snake_case JSON-полей. Вторичная сортировка по ИСУ уже есть в Java.
- PageResponse: `{ data: StudentDto[], page, size, totalElements, totalPages }`. Первая страница — 0; по умолчанию size=20, допустимо 1–100.
- Ошибка Java: `{ error: { code, message, status, timestamp, details } }`. `details` — словарь ошибок полей. Статусы: 400 формат/пагинация, 401 сессия, 403 роль, 404 отсутствие, 409 конфликт, 422 валидация, 500 внутренняя ошибка. У Nuxt 501-заглушки пока собственный формат, это не ответ Java.

## Установка и запуск

Выбрана стабильная Nuxt **4.6.4**, версия зафиксирована в package.json. npm registry при подготовке сообщил Node `^22.22.3 || ^24.15.0 || >=26.0.0`; локальный Node **24.21.0** совместим. Версии всех установленных пакетов сохраняются в package-lock.json. Дополнительные runtime-библиотеки, Pinia, RxJS, UI-фреймворк и ORM не нужны для запуска каркаса.

Из корня репозитория, PowerShell:

```powershell
cd '5 lab'
Copy-Item .env.example .env
npm.cmd ci
npm.cmd run dev
```

Откройте http://localhost:3000. В PowerShell используйте `npm.cmd`, если политика исполнения блокирует npm.ps1; изменять системную политику не требуется. На Linux/macOS команды обычные: `cp .env.example .env`, `npm ci`, `npm run dev`.

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run preview
```

`preview` — проверка сборки локально. Для самостоятельного production Node-процесса:

```powershell
$env:NUXT_PUBLIC_LAB_PREVIEW = 'false'
$env:NUXT_JAVA_API_BASE = 'http://localhost:8080/api'
npm.cmd start
```

Production-сервер сам не читает `.env`. Переменные передаются процессу или через Docker `--env-file`. Java запускается отдельно по `../3 lab/README.md` и `start.ps1` с собственными настройками PostgreSQL/JWT. Секреты Java и доступ к БД не нужны Nuxt. Сборка заглушек не требует работающей Java.

### Режим просмотра и защита

По умолчанию `NUXT_PUBLIC_LAB_PREVIEW=true`: все **учебные страницы** открываются и показывают задания. Баннер сообщает, что защита страниц отключена; фиктивный пользователь не создаётся, транспорт всегда отвечает 501, реальные данные не запрашиваются.

Для проверки middleware задайте `NUXT_PUBLIC_LAB_PREVIEW=false` и перезапустите dev-сервер. Гость с `/profile` или `/students` будет отправлен на `/login?redirect=...`. Пока restoreSession остаётся заглушкой, все считаются гостями. После реализации авторизации этот режим должен быть выключен. В Dockerfile он выключен по умолчанию; для демонстрации каркаса передаётся true явно. Защита Nuxt-страниц никогда не заменяет проверки ролей на Java API.

## Структура проекта

```text
5 lab/
├── app/
│   ├── app.vue                    # NuxtLayout + NuxtPage, индикатор перехода
│   ├── error.vue                  # ошибки Nuxt и настоящая HTTP 404
│   ├── assets/css/main.css        # базовая адаптивность
│   ├── layouts/default.vue        # меню, slot, баннер режима просмотра
│   ├── pages/
│   │   ├── index.vue              # карта самостоятельной работы
│   │   ├── login.vue              # TODO вход
│   │   ├── register.vue           # TODO регистрация
│   │   ├── profile.vue            # TODO профиль и выход
│   │   ├── forbidden.vue          # объяснение отказа роли
│   │   └── students/
│   │       ├── index.vue          # TODO SSR-список и поиск
│   │       ├── new.vue            # TODO создание ADMIN
│   │       └── [id]/
│   │           ├── index.vue      # TODO SSR-карточка, id = ISU
│   │           └── edit.vue       # TODO редактирование ADMIN
│   ├── components/
│   │   ├── LabTask.vue            # пояснение назначения заглушки
│   │   ├── LoadingIndicator.vue   # готовый базовый статус, подключить pending
│   │   ├── ErrorMessage.vue       # alert/retry, подключить нормализацию ошибок
│   │   ├── StudentsTable.vue      # TODO строки и события
│   │   ├── StudentFilters.vue     # TODO фильтры, поиск, сортировка
│   │   ├── StudentPagination.vue  # TODO page/size
│   │   └── StudentForm.vue        # TODO общая форма create/edit
│   ├── composables/
│   │   ├── useApi.ts              # fetch своего origin с SSR-cookie
│   │   ├── useAuth.ts             # TODO сессия; сейчас user=null
│   │   └── useStudents.ts         # основы ключей, TODO чтение/CRUD/кеш
│   └── middleware/access.global.ts # meta.requiresAuth, roles, guestOnly
├── server/api/backend/[...path].ts # 501; TODO ограниченный транспорт к Java
├── shared/types/api.ts            # реальные JSON DTO Java
├── nuxt.config.ts                 # SSR, runtimeConfig, запрет HTTP-кеша
├── tsconfig.json                  # ссылки на генерируемые Nuxt TS-проекты
├── package.json                   # команды и прямые зависимости
├── package-lock.json              # воспроизводимая установка npm ci
├── .env.example                   # адреса без секретов
├── .gitignore                     # .nuxt/.output/node_modules/.env не в Git
├── Dockerfile                     # multi-stage, SSR Node runtime
├── .dockerignore                  # исключает локальные кеши и .env
└── README.md                      # маршрут выполнения и критерии проверки
```

`app/` — структура Nuxt 4; `server/` и `shared/` остаются в корне. `~` указывает на app, `~~` — на корень пятой работы. Nuxt генерирует маршруты из файлов; отдельный createRouter не нужен. Папка `[id]` даёт /students/:id; статический `new.vue` — /students/new.

JSON не допускает комментарии: `package.json` содержит только запуск, сборку, prepare (генерацию .nuxt), typecheck и зависимости. `typescript`/`vue-tsc` нужны для проверки SFC. `tsconfig.json` ссылается на четыре проекта Nuxt; не правьте сгенерированную `.nuxt`. `package-lock.json` создаётся npm, вручную не дописывается. Повторная установка — `npm ci`; после осознанного изменения зависимостей — `npm install` и сохранение нового lockfile.

## Как взаимодействуют части системы

```text
Браузер ── HTML / переходы / запросы того же origin ──► Nuxt
                                                      │
                               SSR, middleware, cookie│ транспорт
                                                      ▼
                                               Java /api/*
                                                      │
                                      бизнес-логика, JWT, роли, JPA
                                                      ▼
                                                  PostgreSQL
```

Nuxt не подключается к БД, не выдаёт роли, не подписывает JWT, не хеширует пароли и не дублирует Java-валидацию. Его серверный endpoint адаптирует **способ передачи** токенов и данных для SSR. Это изменение frontend-инфраструктуры, Java-контракт можно сохранить.

### План SSR и браузерных запросов

При первом запросе защищённой страницы middleware восстанавливает пользователя по cookie через me. Далее страница ожидает `useFetch`/`useAsyncData`: список с текущими фильтрами URL, карточку по ИСУ или исходные данные edit. Результат и безопасный профиль передаются в SSR payload, поэтому при гидратации не нужен второй идентичный запрос. Сейчас SSR рендерит только текст инструкций — SSR **данных студентов** предстоит реализовать.

В браузере происходят ввод/валидация форм, debounce 300 мс, отмена старого поиска, изменение query-параметров, клиентская навигация и CRUD. Обработчики отправки используют `$fetch`/`useApi`, а не `useFetch` внутри click. Данные чтения связываются с реактивным ключом и фильтрами. Не переносите первоначальное чтение только в `onMounted`; это лишает страницу данных при SSR. `window.confirm` допустим только в браузерном обработчике удаления, не во время SSR.

### План JWT, восстановления и middleware

1. Вместо sessionStorage храните access/refresh в отдельных **HttpOnly** cookie, устанавливаемых только Nuxt-транспортом: `path=/`, `sameSite=lax`, `secure=true` при HTTPS; без общего Domain. В dev HTTP secure=false. Сроки согласуйте с Java (по умолчанию access 15 минут, refresh 30 дней); access-cookie не должна теряться раньше возможности refresh. Не храните пару в useState, публичном runtimeConfig или HTML.
2. POST login/register: Nuxt отправляет Java исходный DTO, получает пару, выставляет cookie. В браузер возвращает безопасный ответ (например, без тела), затем useAuth вызывает me. Нельзя просто проксировать TokenResponse в браузер и считать HttpOnly-задачу выполненной. Регистрация всегда USER; роль берётся из me.
3. Браузер делает запросы **к своему Nuxt origin**. Cookie прикладываются автоматически; useApi не читает JWT и не добавляет Bearer в браузере. При SSR `useRequestFetch` передаёт cookie текущего запроса во внутренний Nuxt endpoint. Этот endpoint читает access-cookie и ставит `Authorization: Bearer <access>` в запрос Java. Java сейчас читает Bearer, не cookie. Не пересылайте Java все cookie/Authorization входящего клиента, только явно выбранный токен.
4. `/me` возвращает user. `useState` внутри composable изолирует состояние разных SSR-запросов и гидратируется в браузере. initialized предотвращает повторное восстановление в том же приложении; после F5 создаётся новый SSR-контекст и me выполняется заново. null/user не должны быть глобальными ref на уровне модуля. Не доверяйте decoded JWT или самой наличности cookie как подтверждению входа.
5. При 401 разрешите **одну** попытку refresh и повтор исходного запроса; не повторяйте auth login/register/logout бесконечно. Java ротирует refresh: повторное использование старого токена невалидно. Сначала восстановите сессию до запуска параллельных SSR-запросов данных. В браузере объединяйте refresh в пределах приложения. Для одновременных вкладок/SSR-запросов нужен отдельный разбор гонки: не копируйте глобальную Promise из SPA на общий сервер; координация должна быть по сессии, без смешивания пользователей. Для учебного этапа явно протестируйте две вкладки и опишите выбранную стратегию перед признанием refresh завершённым.
6. Важная особенность SSR: Set-Cookie от **внутреннего** запроса не автоматически попадает во внешний HTML-ответ. Если refresh произошёл во время SSR, перенесите Set-Cookie на ответ текущего SSR event (например, явным appendResponseHeader с каждым отдельным значением) либо выполняйте обновление в обработчике внешнего запроса перед SSR. Нельзя прочитать новый токен из cookie исходного запроса: используйте обновлённую пару в текущем контексте. В браузере Set-Cookie своего endpoint применяется автоматически. Удаление cookie на SSR при 401 тоже должно попасть во внешний ответ.
7. 401 после refresh очищает сессию; 403 ведёт на отказ в доступе; сетевые ошибки/5xx показывают ошибку и повтор, **не** трактуются как «гость». Middleware ожидает восстановление, проверяет requiresAuth и roles и возвращает navigateTo. После входа redirect разрешается только на безопасный внутренний путь; исключите `//`, обратные слеши, внешние адреса и циклы login/register. Java проверяет права для каждого запроса независимо от меню и middleware.
8. Logout вызывает Java с refresh из cookie и удаляет обе cookie даже при сбое сети; браузер очищает user и все персональные async data. Не заявляйте, что logout мгновенно отзывает уже выданный access JWT: текущая Java отзывает refresh, access живёт до истечения TTL.

**Нужны ли изменения Java?** Для выбранного транспорта — нет: login/refresh уже возвращают пару JSON, me принимает Bearer. Требуется реализовать новое хранение/передачу на стороне Nuxt. Если решите вызывать Java из браузера напрямую, придётся отдельно продумать доступ к JWT, CORS/credentials/cookie и SSR; такой вариант здесь не выбран. JWT-секреты Java в Nuxt не передавать.

Cookie-аутентификация меняет модель CSRF: перед реализацией изменяющих операций ограничьте Origin своим приложением и добавьте CSRF-защиту. SameSite=Lax — дополнительная мера, не единственная проверка. Транспорт должен разрешать только перечисленные пути/методы к фиксированному javaApiBase; не принимать произвольный URL клиента. Пробрасывайте Java-статусы и безопасные ошибки; сетевую недоступность можно отобразить как 502/503. Не логируйте пароль, токены или Cookie.

### План кеширования и CRUD

Начните с кеша **внутри Nuxt-приложения** через useFetch/useAsyncData и общий key, без Redis и без HTTP-кеша. useStudents уже намечает ключи `students:<username>:list:<канонические фильтры>` и `students:<username>:detail:<isu>`. Перед сериализацией удалите пустые фильтры, задайте defaults page/size/sort и стабильный порядок свойств. Любое поле поиска, сортировка, страница и размер должны менять ключ. Username берётся из проверенного me, не из пользовательского ввода. При выходе/входе очистите данные даже при совпадении имени пользователя.

SSR payload устраняет повтор запроса при гидратации; одинаковый key позволяет использовать одно состояние. Это не автоматический долгоживущий TTL-кеш навигации: если нужна повторная выдача уже загруженного списка, реализуйте `getCachedData`/useNuxtData со временем получения в пределах приложения и явно задайте срок, например 30 секунд. Устаревшее значение требует нового запроса. Это TODO, кеширование данных пока не завершено.

После **успешного** POST/PUT/PATCH/DELETE очистите все ключи `students:` (включая неактивные варианты фильтров), затем выполните новый запрос активного списка/карточки через refresh/refreshNuxtData. Можно сначала снять снимок активных ключей, затем clearNuxtData и обновить их. Не обновляйте данные как будто успех получен при 409/422/сети. После удаления последней строки страницы уменьшите page, если page>0, и повторите поиск. После удаления карточки — переход к списку. При logout очистка обязательна.

`nuxt.config.ts` уже ставит `Cache-Control: private, no-store`; транспорт делает то же. Не добавляйте `swr`, `isr`, prerender персональных страниц, cachedEventHandler или глобальный Map студентов/профилей. Ключ с username **не делает общий серверный кеш безопасным сам по себе**: здесь такой кеш вообще не нужен. Не помещайте JWT в key. Проверяйте двумя независимыми браузерными сессиями и исходным HTML, что пользователь B не получает payload пользователя A.

## Порядок выполнения небольшими шагами

1. Запустите каркас, откройте карту и страницы. Сравните `shared/types/api.ts` с Java DTO и реальным ответом API.
2. Реализуйте allowlist транспорта и login/register с HttpOnly-cookie. Затем me и logout; проверьте cookie в DevTools, не выводя значения в логи.
3. Реализуйте useAuth.restoreSession и ошибки. Подключите формы входа/регистрации. Сначала проверьте реальный вход и F5; затем refresh, SSR Set-Cookie и гонки двух вкладок.
4. Отключите labPreview, проверьте гостя/USER/ADMIN, безопасный redirect и повтор при недоступной Java. Обновите layout по состоянию сессии.
5. Подключите первый SSR-список без фильтров. Покажите pending/error/empty, не называйте отсутствие запроса «студентов нет».
6. Перенесите фильтры/поиск/сортировку/пагинацию, храните их в URL, добавьте debounce и AbortSignal. Проверьте точное совпадение имени, false и page=0.
7. Реализуйте SSR-карточку `[id]`, валидацию формата и перевод реального Java 404 в error.vue.
8. Перенесите StudentForm, подключите создание и PUT-редактирование; добавьте DELETE с подтверждением. Инвалидируйте списки и карточки только после успеха.
9. Завершите локальный кеш, обновление/очистку при CRUD и logout, профиль, адаптивное меню/таблицу/формы.
10. Выполните typecheck/build, проверки разных ролей/SSR/ошибок; соберите Docker, повторите с адресом Java из контейнера. Удаляйте учебные LabTask по мере готовности, не оставляйте labPreview включённым для готового приложения.

## Работа в паре: две задачи, код пишем самостоятельно

В GitHub ведём ровно две задачи: **«ЛР 5 Артем»** (`qulin-ds`) и **«ЛР 5 Андрей»** (`l1234-tech`). Внутри — чеклисты, отдельные карточки под каждый пункт не нужны. Этот коммит содержит каркас; готовую лабораторную предстоит написать участникам вручную.

| Участник | Своя реализация | Проверка части напарника |
| --- | --- | --- |
| Артём | Транспорт Java/HttpOnly-cookie, useApi/useAuth, вход/регистрация/профиль, middleware и меню; SSR-список/карточка, поиск/фильтры/сортировка/пагинация, удаление, useStudents и кеш | Создание/редактирование Андрея: USER/ADMIN, 409/422, обновление карточки и списка; повторить его Docker-запуск |
| Андрей | StudentForm, создание и редактирование студентов с настоящими POST/PUT, SSR исходных данных edit, ошибки полей и обновление после сохранения; довести Docker и инструкции запуска | Авторизация/F5/refresh/logout, SSR списка/карточки, роли, 404, поиск/кеш, отсутствие чужих данных; самостоятельно исправить найденные ошибки, согласовав общие файлы |

Артём сохраняет основную часть реализации. У Андрея есть законченный пользовательский сценарий и проверка интеграции, а не только форматирование. Доля работы не обязана быть 50/50, но каждый должен уметь объяснить свой код и показать собственные коммиты на защите.

### Границы файлов и порядок интеграции

1. Создайте рабочие ветки `lab5-artem` и `lab5-andrey` от актуальной main после коммита каркаса. Делайте небольшие осмысленные коммиты под своими аккаунтами, связывайте PR со своей задачей. Не закрывайте задачу публикацией каркаса — только после реализации и перекрёстной проверки.
2. Артём владеет `server/api/backend/[...path].ts`, `app/composables/*`, `app/middleware/*`, `app/layouts/default.vue`, страницами входа/регистрации/профиля и списка/карточки, `StudentsTable`, `StudentFilters`, `StudentPagination`.
3. Андрей владеет `app/components/StudentForm.vue`, `app/pages/students/new.vue`, `app/pages/students/[id]/edit.vue`, `Dockerfile`, `.dockerignore` и разделом Docker в README. Общие стили, LoadingIndicator/ErrorMessage, DTO и nuxt.config менять по согласованию; не прогонять форматирование всех файлов параллельно работе напарника.
4. Сначала согласуйте интерфейсы: `useApi()` возвращает функцию запроса, `useAuth().user` — ref `{ username, role } | null`, `useStudents().invalidate()` — Promise<void>, после успешного изменения очищающая кеш студентов. `listKey(filters)` и `detailKey(isu)` формируют ключи чтения. Это целевой контракт: заглушки ещё не работают. StudentForm принимает `initialStudent`, `mode`, `pending`, `errors` и отправляет `submit(StudentCreateRequest)`/`cancel`.
5. Пока Артём делает авторизацию, Андрей переносит форму и её валидацию из четвёртой работы. Реальные POST/PUT и SSR загрузки edit подключаются после готовности транспорта; не подменяйте их успешными заглушками. При успешном сохранении страницы Андрея вызывают согласованную invalidate, затем переходят к карточке. Механизм кеша остаётся в useStudents у Артёма.
6. Каждый проверяет свой сценарий, затем второй участник повторяет его с чистой установкой. Андрей фиксирует найденные ошибки и исправления в своей задаче/PR, Артём проверяет его формы и запуск. Перед объединением проверяются typecheck/build и реальные роли Java. Третью/четвёртую работу без отдельно выявленной необходимости не менять.

### Что разрешено публиковать

Коммитим исходники, документацию, Dockerfile, package.json, **package-lock.json** и безопасный **.env.example**. Не коммитим настоящий `.env` и его варианты, JWT/пароли, приватные ключи, дампы и реальные персональные данные, node_modules, .nuxt, .output и локальные data/dumps. Их исключают .gitignore и .dockerignore. Пример окружения содержит только адреса и переключатели без секретов.

Перед каждым коммитом выполните `git status --short`, после `git add` проверьте `git diff --cached --name-only` и `git diff --cached`. Не используйте `git add -f` для обхода исключений. В задачах/PR показывайте результаты проверок без значений токенов, паролей и персональных данных.

## Требования и проверка результата

| Требование ТЗ | Файлы | Что сделать | Как проверить |
| --- | --- | --- | --- |
| Регистрация, JWT-вход | login.vue, register.vue, useAuth.ts, server/api/backend/[...path].ts | формы, cookie-транспорт, me/refresh/logout | неверный пароль 401; реальный вход и F5; JWT нет в payload |
| Список студентов | students/index.vue, StudentsTable.vue, useStudents.ts | SSR PageResponse | строки есть в исходном HTML с выключенным JS |
| Поиск и фильтры | StudentFilters.vue, students/index.vue | JSON фильтры, debounce/отмена, URL query | точное имя; false; быстрый ввод не показывает старый ответ |
| Сортировка/пагинация | StudentFilters.vue, StudentPagination.vue | sort и page/size в Java | оба направления, page=0, последняя страница, F5 query |
| Добавление/изменение | new.vue, [id]/edit.vue, StudentForm.vue | POST/PUT, details, неизменный ISU | 201/200, 409/422, повтор после ошибки |
| Удаление | StudentsTable.vue, [id]/index.vue, useStudents.ts | DELETE, подтверждение, инвалидация | 204 без JSON; удаление последней строки страницы |
| Роли | access.global.ts, layout, страницы | восстановление, меню, отключить labPreview | гость → login; USER → forbidden на ADMIN; прямой API USER даёт 403 |
| Профиль | profile.vue, useAuth.ts | username/role и выход | F5; logout; недоступность предыдущего профиля |
| Адаптивность | main.css, layout, компоненты | перенести формы/таблицу/меню | 360/768/1280px и клавиатура |
| SSR | nuxt.config.ts, страницы, useApi/useAuth | первые данные на сервере, безопасный payload | прямой HTTP HTML, нет двойного запроса при гидратации |
| /students/[id] | students/[id]/index.vue | id как ISU, SSR GET | прямой URL, переход между двумя id, отсутствующий ИСУ 404 |
| Middleware | access.global.ts, definePageMeta страниц | ожидание me, 401/403, redirect | F5 защищённого URL и клиентский переход |
| Loading/error/404 | LoadingIndicator.vue, ErrorMessage.vue, error.vue | подключить к реальным запросам | throttling, Java offline, 422 и HTTP 404 |
| Кеш/обновление | useStudents.ts, useAuth.ts | ключи, getCachedData/срок, invalidate/clear | возврат к списку, истечение срока, CRUD, две сессии, logout/login |
| Docker | Dockerfile, .dockerignore, .env.example | проверить образ, runtime env, Java hostname | запуск контейнера и SSR страницы; секретов в образе нет |

## Что переносить из четвёртой работы

Все пути в этой таблице относительно `../4 lab/src/`. Переносите частями с TypeScript, не копируйте SPA-инициализацию целиком.

| Источник | Куда и с какой адаптацией |
| --- | --- |
| api/auth.js, api/students.js | useAuth/useStudents и транспорт: точные пути, тела и обёртки ответов |
| api/http.js | обработка статусов, деталей, 204, отмены, один retry; хранение sessionStorage заменить cookie на сервере |
| stores/auth.js | useAuth: состояния и восстановление; без токенов в useState и глобального listener |
| router/index.js | definePageMeta и access.global.ts, без createRouter |
| stores/students.js | useStudents: CRUD и пагинация; чтение через SSR async data вместо ручных общих ref |
| composables/useStudentSearch.js | debounce 300ms, отмена и защита от устаревшего ответа; можно средствами Vue без RxJS |
| pages/StudentsPage.vue | students/index.vue; onMounted заменить SSR-получением данных |
| pages/StudentPage.vue | students/[id]/index.vue; props.isu заменить route.params.id |
| pages/StudentCreatePage.vue, StudentEditPage.vue | new.vue и [id]/edit.vue; useRouter допустим, переход через navigateTo/NuxtLink |
| pages/LoginPage.vue, RegisterPage.vue | формы login.vue/register.vue, подтверждение пароля и правила ввода |
| pages/ProfilePage.vue | profile.vue: username/role/logout, без выдуманного email |
| components/StudentForm.vue | общая типизированная StudentForm с сохранением правил и errors.details |
| components/StudentsTable.vue | таблица, NuxtLink вместо RouterLink, typed props/emits |
| components/StudentFilters.vue, SearchInput.vue | StudentFilters.vue: фильтры и поле поиска |
| components/StudentPagination.vue | page/size/events с типами |
| components/LoadingIndicator.vue, ErrorMessage.vue | оформить существующие базовые компоненты каркаса |
| App.vue, styles/main.css | layout и main.css; навигация по реальному user, адаптивность |
| pages/NotFoundPage.vue, ForbiddenPage.vue | error.vue и forbidden.vue; 404 должна сохранять HTTP-статус |

## Docker и разные адреса

Из `5 lab`:

```powershell
docker build -t student-management-lab5 .
docker run --rm -p 3000:3000 --env-file .env -e NUXT_PUBLIC_LAB_PREVIEW=true -e NUXT_JAVA_API_BASE=http://host.docker.internal:8080/api student-management-lab5
```

Это команда **показа каркаса**. После реализации используйте labPreview=false, HTTPS и cookieSecure=true (через env). `--env-file .env` передаёт настройки при запуске, сам файл не копируется в образ. Образ многоэтапный, запускается пользователем node и содержит только `.output`.

| Кто обращается | Адрес |
| --- | --- |
| Браузер → Nuxt | http://localhost:3000, API `/api/backend` на том же origin |
| Nuxt локально → Java | `NUXT_JAVA_API_BASE=http://localhost:8080/api` |
| Nuxt в Docker Desktop → Java на хосте | `http://host.docker.internal:8080/api` |
| Nuxt и Java в общей Docker-сети | `http://backend:8080/api`, если имя сервиса backend |
| Java → PostgreSQL | собственный DB_URL из третьей работы, Nuxt его не использует |

На Linux для доступа к Java на хосте может понадобиться `--add-host=host.docker.internal:host-gateway`. `localhost` внутри контейнера — сам контейнер. Не задавайте браузеру `http://backend:8080`: это имя Docker-сети, недоступное с компьютера пользователя. В выбранной схеме отдельного публичного Java URL вообще не нужно; `NUXT_PUBLIC_API_BASE` — относительный адрес Nuxt, приватный javaApiBase никогда не попадает в браузер.

Сборка каркаса должна проходить уже сейчас: незавершённость авторизации/CRUD не требует отключать SSR или обращаться к Java во время build. Docker daemon нужен отдельно для фактической проверки контейнера.

## Что пока не реализовано

- Транспорт отвечает **501 для любого пути**. Allowlist, передача в Java, cookie, CSRF, refresh и перенос SSR Set-Cookie — TODO.
- useAuth возвращает null; restoreSession только помечает инициализацию, login/register/logout явно выбрасывают ошибку «не реализовано». Не считайте initialized доказательством авторизации.
- useStudents содержит только основы ключей и TODO инвалидации. Нет запросов, TTL-кеша и CRUD; invalidate явно выбрасывает ошибку.
- Страницы и StudentForm/StudentsTable/StudentFilters/StudentPagination — инструкции без сетевых запросов, без тестовых записей и кнопок фиктивного сохранения.
- Навигация layout ещё не зависит от роли; labPreview обходит только проверки страниц для чтения заданий.
- LoadingIndicator/ErrorMessage базово работают, но к настоящим запросам ещё не подключены. Формат неверного `[id]` даёт 404 уже сейчас; отсутствие реальной записи с корректным ИСУ пока не проверяется.
- Реальная авторизация с Java, SSR персональных данных, ротация в двух вкладках, CRUD и адаптивность будущих форм требуют проверки после самостоятельной реализации.

## Официальные источники

Версия проверена через `npm view nuxt version engines`: 4.6.4. Структура и API сверяются с официальной документацией Nuxt 4:

- [Файловые страницы и динамические параметры](https://nuxt.com/docs/4.x/directory-structure/app/pages)
- [Route middleware](https://nuxt.com/docs/4.x/directory-structure/app/middleware)
- [useFetch: SSR и передача cookie](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Runtime config и переменные окружения](https://nuxt.com/docs/4.x/guide/going-further/runtime-config)
- [Обновление async data](https://nuxt.com/docs/4.x/api/utils/refresh-nuxt-data)
- [Node.js deployment](https://nuxt.com/docs/4.x/getting-started/deployment)

## Выполненные проверки каркаса

Проверено при подготовке 10.11.2026 на Windows, Node 24.21.0:

| Проверка | Результат |
| --- | --- |
| `npm.cmd install` и postinstall `nuxt prepare` | успешно; package-lock.json создан и обновлён после согласования Vue Router 5.4 с Nuxt |
| `npm.cmd run typecheck` | успешно, без ошибки плагина Vue Router |
| `npm.cmd run build` | успешно, создан SSR Node server в .output |
| Запуск `.output/server/index.mjs` | успешно; проверены отдельные процессы с labPreview=true и false |
| HTTP-страницы в режиме просмотра | `/`, `/login`, `/register`, `/profile`, `/students`, `/students/new`, `/students/100000`, `/students/100000/edit`, `/forbidden` → 200; заголовки уже присутствуют в HTML без выполнения браузерного JS |
| HTTP-кеш обычных страниц | `Cache-Control` содержит no-store |
| Неизвестный URL и `/students/abc` | 404; с браузерным `Accept: text/html` отображается собственная error.vue; JSON-клиент получает JSON ошибки |
| Middleware при labPreview=false | `/profile`, `/students`, `/students/new`, `/students/100000/edit` → 302 на `/login?redirect=...`; `/login` → 200 |
| API-заглушка | GET me и POST login → 501; login не устанавливает cookie |
| Третья и четвёртая работы | изменённых файлов нет; новые исходники только в `5 lab` |
| Docker | команда docker в окружении не найдена, сборка/запуск контейнера **не проверены** |

Первый build внутри ограниченной Windows-песочницы завершился EPERM при readlink родительского каталога в Nitro file tracing; повтор той же сборки с разрешённым доступом завершился успешно. Это ограничение среды, обходы в исходники не добавлены.

Установка npm сообщила 12 замечаний audit (6 low, 6 moderate) в дереве зависимостей. Принудительное `npm audit fix --force` не выполнялось: оно может сменить согласованные версии. Установка и сборка прошли; это не утверждение об отсутствии замечаний зависимостей.

Реальные сценарии USER/ADMIN, интеграция с Java, SSR данных, TTL-кеш и refresh ещё не проверяются — соответствующая функциональность оставлена для самостоятельной работы. Проверка HTTP не заменяет будущую ручную проверку интерфейса в браузере и на мобильной ширине.
