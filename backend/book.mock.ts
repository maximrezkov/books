/**
 * Моковый бэк через MSW
 */
import { http, HttpResponse } from 'msw'

interface Author { id: number; full_name: string }
interface Book {
  id: number
  title: string
  year: number
  description: string
  isbn: string
  cover_url: string
  author_ids: number[]
}

const api = '*/api/v1'
let authors: Author[] = [
  { id: 1, full_name: 'Анна Миронова' },
  { id: 2, full_name: 'Павел Орлов' },
]
let books: Book[] = [
  { id: 1, title: 'Город у моря', year: 2025, description: 'Демо-книга', isbn: '', cover_url: '', author_ids: [1, 2] },
  { id: 2, title: 'Северный ветер', year: 2024, description: 'Демо-книга', isbn: '', cover_url: '', author_ids: [1] },
]
let nextBookId = 3
let nextAuthorId = 3

const ok = <T>(data: T, status = 200) => HttpResponse.json({ success: true, data }, { status })
const notFound = () => HttpResponse.json(
  { success: false, errors: [{ field: 'id', message: 'Не найдено' }] }, { status: 404 },
)
const bookView = ({ author_ids, ...book }: Book) => ({
  ...book, authors: authors.filter(author => author_ids.includes(author.id)),
})
const authorView = (author: Author) => ({
  ...author,
  books: books.filter(book => book.author_ids.includes(author.id))
    .map(({ id, title, year }) => ({ id, title, year })),
})

function list<T>(items: T[], query: URLSearchParams) {
  const page = Math.max(1, Number(query.get('page')) || 1)
  const per_page = Math.max(1, Number(query.get('per-page')) || 20)
  return {
    items: items.slice((page - 1) * per_page, page * per_page),
    pagination: { total: items.length, page, per_page, total_pages: Math.ceil(items.length / per_page) },
  }
}

async function readBookForm(request: Request): Promise<Omit<Book, 'id'>> {
  const form = await request.formData()
  const cover = form.get('cover')
  return {
    title: String(form.get('title') ?? ''),
    year: Number(form.get('year')),
    description: String(form.get('description') ?? ''),
    isbn: String(form.get('isbn') ?? ''),
    author_ids: JSON.parse(String(form.get('author_ids') ?? '[]')) as number[],
    cover_url: cover instanceof File ? URL.createObjectURL(cover) : '',
  }
}

export const handlers = [
  http.all(`${api}/*`, ({ request }) => {
    const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
    if (isWrite && !new URL(request.url).pathname.endsWith('/auth/login') && request.headers.get('Authorization') !== 'Bearer mock-token') {
      return HttpResponse.json({ success: false, errors: [{ message: 'Войдите в аккаунт.' }] }, { status: 401 })
    }
  }),
  http.post(`${api}/auth/login`, async ({ request }) => {
    const { username, password } = await request.json() as { username?: string; password?: string }
    if (!username?.trim() || !password) {
      return HttpResponse.json({ success: false, errors: [{ message: 'Введите логин и пароль.' }] }, { status: 401 })
    }
    return ok({
      token: 'mock-token', expires_at: new Date(Date.now() + 3_600_000).toISOString(),
      user: { id: 1, username, role: 'user' },
    })
  }),

  http.get(`${api}/books`, ({ request }) => {
    const q = new URL(request.url).searchParams
    const search = (q.get('search') ?? '').toLowerCase()
    const filtered = books.filter(book =>
      `${book.title} ${book.description} ${book.isbn}`.toLowerCase().includes(search) &&
      (!q.has('year') || book.year === Number(q.get('year'))) &&
      (!q.has('author_id') || book.author_ids.includes(Number(q.get('author_id')))),
    )
    return ok(list(filtered.map(bookView), q))
  }),

  http.get(`${api}/books/:id`, ({ params }) => {
    const book = books.find(book => book.id === Number(params.id))
    return book ? ok(bookView(book)) : notFound()
  }),

  http.post(`${api}/books`, async ({ request }) => {
    const fields = await readBookForm(request)
    const book = { ...fields, id: nextBookId++ }
    books.push(book)
    return ok(bookView(book), 201)
  }),

  http.put(`${api}/books/:id`, async ({ params, request }) => {
    const book = books.find(book => book.id === Number(params.id))
    if (!book) return notFound()
    const fields = await readBookForm(request)
    Object.assign(book, fields, { cover_url: fields.cover_url || book.cover_url })
    return ok(bookView(book))
  }),

  http.patch(`${api}/books/:id`, async ({ params, request }) => {
    const book = books.find(book => book.id === Number(params.id))
    if (!book) return notFound()
    const patch = await request.json() as Partial<Omit<Book, 'id' | 'cover_url'>>
    // Копируем только поля BookInput из спецификации.
    for (const key of ['title', 'year', 'description', 'isbn', 'author_ids'] as const) {
      if (key in patch) Object.assign(book, { [key]: patch[key] })
    }
    return ok(bookView(book))
  }),

  http.delete(`${api}/books/:id`, ({ params }) => {
    if (!books.some(book => book.id === Number(params.id))) return notFound()
    books = books.filter(book => book.id !== Number(params.id))
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${api}/authors`, ({ request }) => {
    const q = new URL(request.url).searchParams
    const search = (q.get('search') ?? '').toLowerCase()
    return ok(list(authors.filter(author => author.full_name.toLowerCase().includes(search)), q))
  }),

  http.get(`${api}/authors/:id`, ({ params }) => {
    const author = authors.find(author => author.id === Number(params.id))
    return author ? ok(authorView(author)) : notFound()
  }),

  http.post(`${api}/authors`, async ({ request }) => {
    const { full_name } = await request.json() as Pick<Author, 'full_name'>
    const author = { id: nextAuthorId++, full_name }
    authors.push(author)
    return ok(authorView(author), 201)
  }),

  http.put(`${api}/authors/:id`, async ({ params, request }) => {
    const author = authors.find(author => author.id === Number(params.id))
    if (!author) return notFound()
    const { full_name } = await request.json() as Pick<Author, 'full_name'>
    author.full_name = full_name
    return ok(authorView(author))
  }),

  http.delete(`${api}/authors/:id`, ({ params }) => {
    const id = Number(params.id)
    if (!authors.some(author => author.id === id)) return notFound()
    authors = authors.filter(author => author.id !== id)
    books.forEach(book => { book.author_ids = book.author_ids.filter(authorId => authorId !== id) })
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${api}/reports/top-authors`, ({ request }) => {
    const year = Number(new URL(request.url).searchParams.get('year'))
    if (!Number.isInteger(year) || year < 1) {
      return HttpResponse.json({ success: false, errors: [{ field: 'year', message: 'Укажите год.' }] }, { status: 400 })
    }
    const items = authors.map(author => ({
      author_id: author.id, full_name: author.full_name,
      books_count: books.filter(book => book.year === year && book.author_ids.includes(author.id)).length,
    }))
      .filter(author => author.books_count > 0)
      .sort((a, b) => b.books_count - a.books_count)
      .slice(0, 10)
      .map((author, index) => ({ ...author, rank: index + 1 }))
    return ok({ year, items })
  }),
]

export async function startMockApi() {
  const { setupWorker } = await import('msw/browser')
  const worker = setupWorker(...handlers)
  await worker.start({ onUnhandledRequest: 'bypass' })
  return worker
}
