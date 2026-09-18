import assert from 'node:assert/strict'
import { before, after, beforeEach, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { effectScope, nextTick, ref } from 'vue'

let vite, server, api, session, ApiError
const cookies = new Map()
const cookieWrites = []

before(async () => {
  globalThis.location = new URL('http://localhost/')
  globalThis.document = {
    get cookie() { return [...cookies].map(([key, value]) => `${key}=${value}`).join('; ') },
    set cookie(value) {
      cookieWrites.push(value)
      const [pair, ...attributes] = value.split('; ')
      const separator = pair.indexOf('=')
      const key = pair.slice(0, separator)
      const expires = attributes.find(item => item.startsWith('Expires='))?.slice(8)
      if (expires && new Date(expires).getTime() <= Date.now()) cookies.delete(key)
      else cookies.set(key, pair.slice(separator + 1))
    },
  }
  process.env.VITE_API_BASE_URL = 'http://localhost/api/v1'
  vite = await createServer({
    configFile: false,
    cacheDir: 'node_modules/.vite-tests',
    server: { middlewareMode: true, hmr: false, watch: null },
    resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  })
  const { handlers } = await vite.ssrLoadModule('/backend/book.mock.ts')
  server = setupServer(...handlers)
  server.listen({ onUnhandledRequest: 'error' })
  ;({ api, ApiError } = await vite.ssrLoadModule('/src/services/api.ts'))
  session = await vite.ssrLoadModule('/src/services/session.ts')
})

beforeEach(() => {
  session.clearSession()
  server.resetHandlers()
})
after(async () => {
  session?.clearSession()
  server?.close()
  await vite?.close()
})

async function login() {
  const result = await api.login({ username: 'reader', password: 'test-password' })
  session.saveSession(result)
  return result
}

test('гость видит каталог, фильтры, пагинацию и книгу с несколькими авторами', async () => {
  const page = await api.books({ 'per-page': 1, page: 2 })
  assert.equal(page.items.length, 1)
  assert.equal(page.pagination.total_pages, 2)
  const filtered = await api.books({ author_id: 2, year: 2025, search: 'море' })
  assert.equal(filtered.items.length, 0)
  const book = await api.book(1)
  assert.equal(book.authors.length, 2)
  const matches = await api.books({ author_id: 2, year: 2025, search: 'Город' })
  assert.deepEqual(matches.items.map(book => book.id), [1])
  await assert.rejects(api.book(999999), error => error instanceof ApiError && error.status === 404)
})

test('отчёт учитывает год и соавторов', async () => {
  const report = await api.topAuthors(2025)
  assert.deepEqual(report.items.map(author => [author.rank, author.author_id, author.books_count]), [[1, 1, 1], [2, 2, 1]])
  assert.equal((await api.topAuthors(1900)).items.length, 0)
  await assert.rejects(api.topAuthors(0), error => error.status === 400)
})

test('гость не может изменять книги и авторов', async () => {
  await assert.rejects(api.deleteBook(1), error => error.status === 401)
  await assert.rejects(api.patchBook(1, { title: 'Запрещено' }), error => error.status === 401)
  await assert.rejects(api.createAuthor({ full_name: 'Запрещено' }), error => error.status === 401)
  assert.equal((await api.book(1)).title, 'Город у моря')
})

test('вход сохраняет cookie, восстановление сессии и выход', async () => {
  await assert.rejects(api.login({ username: '', password: '' }), error => error.status === 401)
  await login()
  assert.equal(session.isAuthenticated.value, true)
  assert.equal(session.currentUser.value.username, 'reader')
  assert.ok(cookies.has('books_token'))
  assert.ok(cookieWrites.some(value => value.includes('SameSite=Lax') && value.includes('Path=/')))
  session.restoreSession()
  assert.equal(session.getToken(), 'mock-token')
  session.clearSession()
  assert.equal(session.isAuthenticated.value, false)
  assert.equal(cookies.size, 0)
})

test('истёкший токен и ответ 401 удаляют сессию', async () => {
  await login()
  cookies.set('books_token_expires', String(Date.now() - 1000))
  session.restoreSession()
  assert.equal(session.isAuthenticated.value, false)
  session.saveSession({ token: 'invalid-token', expires_at: new Date(Date.now() + 60000).toISOString() })
  await assert.rejects(api.deleteBook(1), error => error.status === 401)
  assert.equal(session.isAuthenticated.value, false)
  assert.equal(cookies.size, 0)
})

test('авторизованный пользователь создаёт, изменяет и удаляет книгу и автора', async () => {
  await login()
  const author = await api.createAuthor({ full_name: 'Тестовый автор' })
  assert.equal((await api.author(author.id)).full_name, 'Тестовый автор')
  await api.updateAuthor(author.id, { full_name: 'Новый автор' })
  const form = new FormData()
  form.set('title', 'Тестовая книга')
  form.set('year', '2026')
  form.set('description', 'Описание')
  form.set('isbn', 'test-isbn')
  form.set('author_ids', JSON.stringify([1, author.id]))
  form.set('cover', new File(['test image'], 'cover.png', { type: 'image/png' }))
  const book = await api.createBook(form)
  assert.equal(book.authors.length, 2)
  assert.ok(book.cover_url.startsWith('blob:'))
  assert.equal((await api.topAuthors(2026)).items.length, 2)
  const patched = await api.patchBook(book.id, { title: 'После редактирования' })
  assert.equal(patched.title, 'После редактирования')
  assert.equal(patched.cover_url, book.cover_url)
  form.set('title', 'Полное обновление')
  const updated = await api.updateBook(book.id, form)
  assert.equal(updated.title, 'Полное обновление')
  assert.equal((await api.author(author.id)).books[0].id, book.id)
  await api.deleteBook(book.id)
  await assert.rejects(api.book(book.id), error => error.status === 404)
  await api.deleteAuthor(author.id)
  await assert.rejects(api.author(author.id), error => error.status === 404)
})

test('ошибки API отображаются как ошибки, а не как пустой каталог', async () => {
  server.use(http.get('*/api/v1/books', () => HttpResponse.json({
    success: false, errors: [{ field: 'year', message: 'Некорректный год' }],
  }, { status: 422 })))
  await assert.rejects(api.books(), error => error.status === 422 && error.message === 'Некорректный год')
  server.use(http.get('*/api/v1/books', () => new HttpResponse('Unavailable', { status: 503 })))
  await assert.rejects(api.books(), error => error.status === 503)
  server.use(http.get('*/api/v1/books', () => HttpResponse.error()))
  await assert.rejects(api.books())
})

test('при быстрой смене фильтра старый ответ не заменяет новый', async () => {
  const { useApiResource } = await vite.ssrLoadModule('/src/composables/use-api-resource.ts')
  const filter = ref(2025)
  const pending = []
  const scope = effectScope()
  const resource = scope.run(() => useApiResource(signal => new Promise(resolve => {
    pending.push({ signal, resolve })
  }), () => filter.value))
  filter.value = 2024
  await nextTick()
  assert.equal(pending[0].signal.aborted, true)
  pending[1].resolve('2024')
  await nextTick()
  pending[0].resolve('2025')
  await nextTick()
  assert.equal(resource.data.value, '2024')
  assert.equal(resource.loading.value, false)
  scope.stop()
})
