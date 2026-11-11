// Чистые проверки URL/DTO и безопасного redirect, без Java и пользовательских данных.
import test from 'node:test'
import assert from 'node:assert/strict'
import { studentFilters } from '../shared/utils/student-filters.ts'
import { loginDestination } from '../app/utils/redirect.ts'

test('filters preserve false, trim text and use stable defaults', () => {
  assert.deepEqual(
    studentFilters({
      name: ' Ivan Ivanov ',
      is_foreign: 'false',
      note: '',
      size: '10',
      page: '0',
    }),
    {
      name: 'Ivan Ivanov',
      is_foreign: false,
      sort: 'ISU,asc',
      page: 0,
      size: 10,
    },
  )

  assert.equal(
    JSON.stringify(studentFilters({ room: 1234, group: 'M3301' })),
    JSON.stringify(studentFilters({ group: 'M3301', room: 1234 })),
  )
})

test('invalid pagination and sort do not enter the request', () => {
  assert.deepEqual(
    studentFilters({
      page: -1,
      size: 101,
      sort: 'password,desc',
      is_foreign: 'anything',
    }),
    {
      sort: 'ISU,asc',
      page: 0,
      size: 20,
    },
  )

  assert.equal(
    studentFilters({ sort: 'checkinDate,desc' }).sort,
    'checkinDate,desc',
  )
})

test('redirect rejects external addresses, encoded separators and auth loops', () => {
  const invalidDestinations = [
    'https://example.test',
    '//example.test',
    '/\\example.test',
    '/%2fexample.test',
    '/login?redirect=/',
    '/foo/../register',
    '/%5cexample.test',
    '/\nexample.test',
  ]

  for (const input of invalidDestinations) {
    assert.equal(loginDestination(input), '/students')
  }

  assert.equal(
    loginDestination('/students/123456?page=2'),
    '/students/123456?page=2',
  )
})
