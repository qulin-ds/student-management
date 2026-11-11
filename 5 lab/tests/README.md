# Проверки лабораторной №5

Чистые проверки не требуют Java: из `5 lab` выполнить `npm.cmd test`.

Интеграционные тесты используют настоящий backend из третьей работы и **только одноразовую тестовую БД**. Они регистрируют временных пользователей и создают/удаляют студентов. Не направляйте их на рабочую или общую PostgreSQL.

## 1. Временная Java/H2

В отдельном PowerShell из `3 lab`:

```powershell
$env:SERVER_PORT = '18080'
$env:DB_URL = 'jdbc:h2:mem:lab5verify;MODE=PostgreSQL;DB_CLOSE_DELAY=-1'
$env:DB_USERNAME = 'sa'
$env:DB_PASSWORD = ''
$env:DB_DDL_GENERATION = 'create-or-extend-tables'
$env:ADMIN_USERNAME = 'lab5_admin'
$env:ADMIN_EMAIL = 'lab5admin@example.test'
$testPassword = Read-Host 'Одноразовый пароль тестового ADMIN (8–72 символа)' -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $testPassword).Password
$env:JWT_ACCESS_SECRET = [guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()
$env:JWT_REFRESH_SECRET = [guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()
mvn.cmd -q spring-boot:run '-Dspring-boot.run.useTestClasspath=true'
```

H2 доступна через test classpath Maven; третья работа не изменяется. Дождитесь создания тестового ADMIN. После остановки Java данные из памяти исчезнут; сгенерированные ключи переданы окружением, не записаны в файлы.

## 2. Интеграция и браузер

Во втором PowerShell из `5 lab`:

```powershell
npm.cmd run typecheck
npm.cmd run build
$env:TEST_DISPOSABLE_DB = 'yes'
$env:TEST_JAVA_BASE = 'http://127.0.0.1:18080/api'
$env:TEST_ADMIN_USERNAME = 'lab5_admin'
$testPassword = Read-Host 'Тот же одноразовый пароль ADMIN' -AsSecureString
$env:TEST_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $testPassword).Password
npm.cmd run test:integration
```

Скрипт запускает собранный Nuxt на 3308, а для проверки недоступной Java — ещё один на 3309. Порты должны быть свободны; процессы Nuxt завершаются в finally. Тест не сохраняет cookie, пароли и снимки профилей на диск и не выводит их значения.

Для браузерных сценариев дополнительно задайте:

```powershell
$env:TEST_BROWSER = 'yes'
$env:TEST_CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
npm.cmd run test:integration
```

Chrome запускается headless с отдельными временными профилями, пользовательский профиль не используется. На другой системе задайте существующий путь Chromium/Chrome либо установите тестовый браузер командой `npx playwright install chromium` и не задавайте TEST_CHROME_PATH. Браузерные сценарии находятся в browser.mjs, HTTP-сценарии — в integration.mjs.

Завершив проверки, остановите Java через Ctrl+C. Эти тесты не подтверждают запуск Docker или работу PostgreSQL — это отдельные пункты основного чеклиста.
