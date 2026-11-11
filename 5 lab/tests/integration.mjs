/** Реальная HTTP-интеграция Nuxt ↔ Java. Нужен backend на отдельной ОДНОРАЗОВОЙ БД.
 * Запуск: TEST_DISPOSABLE_DB=yes, TEST_JAVA_BASE, TEST_ADMIN_USERNAME/PASSWORD, npm run test:integration.
 * Секреты живут только в памяти; значения cookie и паролей никогда не печатаются.
 * Тест сам запускает собранный Nuxt и удаляет созданного студента, но не аккаунты:
 * поэтому разрешается только локальный тестовый backend и явно указанная временная БД.
 */
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

const java = process.env.TEST_JAVA_BASE || 'http://127.0.0.1:18080/api'
assert.equal(process.env.TEST_DISPOSABLE_DB, 'yes', 'Use a disposable test database and set TEST_DISPOSABLE_DB=yes')
assert.ok(['localhost', '127.0.0.1'].includes(new URL(java).hostname), 'Only local test backend is allowed')
assert.ok(process.env.TEST_ADMIN_USERNAME && process.env.TEST_ADMIN_PASSWORD, 'Test admin credentials are required')
const port = 3308
const base = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), NUXT_JAVA_API_BASE: java }, windowsHide: true, stdio: 'ignore',
})
const admin = new Map()
const user = new Map()
let created = false
const isu = 700000 + Math.floor(Math.random() * 90000)
const sample = { ISU: isu, name: 'Ivan Ivanov', group: 'M3301', dormitory: 2, room: 1234, checkin_date: '2025-01-01', is_foreign: false, note: `lab5-${randomUUID()}` }
const jarString = jar => [...jar].map(([k, v]) => `${k}=${v}`).join('; ')
function updateCookies(jar, response) {
  for (const cookie of response.headers.getSetCookie()) {
    const [name, ...value] = cookie.split(';')[0].split('=')
    if (/max-age=0/i.test(cookie)) jar.delete(name)
    else jar.set(name, value.join('='))
  }
}
async function api(jar, path, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${base}/api/backend${path}`, {
    method, redirect: 'manual', headers: { cookie: jarString(jar), accept: 'application/json', 'x-student-client': '1', origin: base, ...(body === undefined ? {} : { 'content-type': 'application/json' }), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  updateCookies(jar, response)
  const text = await response.text()
  return { status: response.status, data: text ? JSON.parse(text) : undefined, headers: response.headers }
}
async function html(jar, path, rawCookie) {
  const response = await fetch(base + path, { redirect: 'manual', headers: { accept: 'text/html', cookie: rawCookie ?? jarString(jar) } })
  updateCookies(jar, response)
  return { response, text: await response.text() }
}
const check = (name) => console.log(`PASS ${name}`)
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    try { await fetch(`${base}/api/backend/unknown`); ready = true; break } catch { await new Promise(resolve => setTimeout(resolve, 100)) }
  }
  assert.ok(ready, 'Nuxt did not start')
  assert.equal((await api(new Map(), '/unknown')).status, 404)
  assert.equal((await api(new Map(), '/auth/login', { method: 'POST', body: {}, headers: { origin: 'https://foreign.test' } })).status, 403)
  assert.equal((await api(new Map(), '/auth/login', { method: 'POST', body: {}, headers: { 'x-student-client': '' } })).status, 403)
  assert.equal((await api(new Map(), '/auth/login', { method: 'POST', body: { username: 'missing', password: 'wrong' } })).status, 401)
  check('allowlist, CSRF and wrong password')

  const registered = await api(user, '/auth/register', { method: 'POST', body: { username: `u_${randomUUID().slice(0, 8)}`, email: `${randomUUID()}@example.test`, password: randomUUID() } })
  assert.equal(registered.status, 201)
  assert.equal(registered.data.accessToken, undefined)
  assert.ok(registered.headers.getSetCookie().every(cookie => /httponly/i.test(cookie) && /samesite=lax/i.test(cookie)))
  assert.equal((await api(user, '/auth/me')).data.role, 'USER')
  assert.equal((await html(user, '/students/new')).response.headers.get('location'), '/forbidden')
  assert.equal((await api(user, '/admin/students', { method: 'POST', body: sample })).status, 403)
  check('registration, HttpOnly and USER permissions')

  assert.equal((await api(admin, '/auth/login', { method: 'POST', body: { username: process.env.TEST_ADMIN_USERNAME, password: process.env.TEST_ADMIN_PASSWORD } })).status, 200)
  assert.equal((await api(admin, '/auth/me')).data.role, 'ADMIN')
  assert.equal((await api(admin, '/admin/students', { method: 'POST', body: { ...sample, name: '' } })).status, 422)
  const inserted = await api(admin, '/admin/students', { method: 'POST', body: sample })
  assert.equal(inserted.status, 201)
  assert.equal(inserted.data.data.ISU, isu)
  created = true
  assert.equal((await api(admin, '/admin/students', { method: 'POST', body: sample })).status, 409)
  const updatedSample = { ...sample, note: `${sample.note}-updated` }
  const updated = await api(admin, `/admin/students/${isu}`, { method: 'PUT', body: updatedSample })
  assert.equal(updated.status, 200)
  assert.equal(updated.data.data.note, updatedSample.note)
  Object.assign(sample, updatedSample)
  check('ADMIN operations and Java validation/conflict statuses')

  const filtered = await api(user, '/user/students/search', { method: 'POST', body: { name: sample.name, is_foreign: false, page: 0, size: 1, sort: 'checkinDate,desc' } })
  assert.equal(filtered.status, 200)
  assert.ok(filtered.data.data.some(student => student.ISU === isu))
  const list = await html(user, '/students?name=Ivan%20Ivanov&is_foreign=false&size=10')
  assert.equal(list.response.status, 200)
  assert.ok(list.text.includes(sample.note), 'Student must be rendered in SSR HTML')
  assert.ok(list.response.headers.get('cache-control').includes('no-store'))
  for (const value of user.values()) assert.ok(!list.text.includes(value), 'JWT leaked to SSR HTML')
  const card = await html(user, `/students/${isu}`)
  assert.equal(card.response.status, 200)
  assert.ok(card.text.includes(sample.note))
  assert.equal((await html(user, '/students/999999')).response.status, 404)
  assert.equal((await html(user, '/students/abc')).response.status, 404)
  assert.equal((await html(user, '/unknown-page')).response.status, 404)
  const profile = await html(user, '/profile')
  assert.ok(!profile.text.includes(process.env.TEST_ADMIN_USERNAME), 'Profile from another session leaked')
  check('SSR list/card, filters, isolated profile, no-store and real HTTP 404')

  // Два отдельных SSR-запроса с одной старой парой обязаны использовать одну ротацию.
  user.set('sm_access', 'invalid-access')
  const oldCookie = jarString(user)
  const refreshed = await Promise.all([html(new Map(user), '/profile', oldCookie), html(new Map(user), '/profile', oldCookie)])
  for (const result of refreshed) {
    assert.equal(result.response.status, 200)
    assert.ok(result.response.headers.getSetCookie().some(cookie => cookie.startsWith('sm_access=')), 'SSR did not forward Set-Cookie')
  }
  const firstCookies = refreshed[0].response.headers.getSetCookie()
  assert.deepEqual(firstCookies, refreshed[1].response.headers.getSetCookie())
  updateCookies(user, refreshed[0].response)
  assert.equal((await api(user, '/auth/me')).status, 200)
  user.set('sm_access', 'invalid-access-again')
  const refreshedList = await html(user, '/students')
  assert.equal(refreshedList.response.status, 200)
  assert.ok(refreshedList.text.includes(sample.note), 'SSR list must use cookie rotated by middleware')
  const invalidSession = new Map([['sm_access', 'invalid'], ['sm_refresh', 'invalid']])
  assert.equal((await api(invalidSession, '/auth/me')).status, 401)
  assert.equal(invalidSession.size, 0, 'Failed refresh must remove both cookies')
  check('concurrent refresh and SSR Set-Cookie propagation')

  if (process.env.TEST_BROWSER === 'yes') {
    const fixture = { ...sample, ISU: isu + 1, note: `browser-${randomUUID()}` }
    assert.equal((await api(admin, '/admin/students', { method: 'POST', body: fixture })).status, 201)
    try {
      const { verifyBrowser } = await import('./browser.mjs')
      await verifyBrowser({ base, adminUsername: process.env.TEST_ADMIN_USERNAME, adminPassword: process.env.TEST_ADMIN_PASSWORD, sample, fixture })
    } finally { await api(admin, `/admin/students/${fixture.ISU}`, { method: 'DELETE' }).catch(() => {}) }
  }

  const removed = await api(admin, `/admin/students/${isu}`, { method: 'DELETE' })
  assert.equal(removed.status, 204)
  assert.equal(removed.data, undefined)
  created = false
  assert.equal((await api(user, `/user/students/${isu}`)).status, 404)
  assert.equal((await api(user, '/auth/logout', { method: 'POST' })).status, 204)
  assert.equal(user.size, 0)
  assert.equal((await html(user, '/profile')).response.status, 302)
  check('DELETE 204, logout and guest redirect')

  // Отдельный Nuxt с недоступной Java: никакого воздействия на основной тестовый backend.
  const offline = spawn(process.execPath, ['.output/server/index.mjs'], {
    env: { ...process.env, HOST: '127.0.0.1', PORT: '3309', NUXT_JAVA_API_BASE: 'http://127.0.0.1:1/api' }, windowsHide: true, stdio: 'ignore',
  })
  try {
    let response
    for (let i = 0; i < 50; i++) {
      try { response = await fetch('http://127.0.0.1:3309/api/backend/auth/me', { headers: { cookie: 'sm_access=unavailable-test' } }); break }
      catch { await new Promise(resolve => setTimeout(resolve, 100)) }
    }
    assert.equal(response?.status, 503)
    const page = await fetch('http://127.0.0.1:3309/profile', { redirect: 'manual', headers: { accept: 'text/html', cookie: 'sm_access=unavailable-test' } })
    assert.equal(page.status, 503, 'Network failure must not become guest redirect')
    check('Java offline -> 503, not guest redirect')
  } finally { offline.kill(); if (offline.exitCode === null) await once(offline, 'exit') }
} finally {
  if (created) await api(admin, `/admin/students/${isu}`, { method: 'DELETE' }).catch(() => {})
  server.kill()
  if (server.exitCode === null) await once(server, 'exit')
}
