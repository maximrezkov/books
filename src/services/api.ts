import type {
  Author, AuthorInput, AuthorListResponseData, AuthorsQueryParams, Book, BookInput,
  BookListResponseData, BooksQueryParams, ErrorItem, LoginRequest, LoginResponseData,
  TopAuthorsResponseData,
} from '@/types'
import { clearSession, getToken } from './session'

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  errors: ErrorItem[]

  constructor(status: number, errors: ErrorItem[] = []) {
    const fallback = status === 401 ? 'Войдите в аккаунт.' : status === 404 ? 'Не найдено.' : 'Не удалось выполнить запрос.'
    super(errors.map(error => error.message).filter(Boolean).join(' ') || fallback)
    this.status = status
    this.errors = errors
  }
}

export function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Не удалось связаться с сервером. Попробуйте ещё раз.'
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, credentials: 'same-origin' })
  if (response.status === 401) clearSession()
  if (response.status === 204) return undefined as T
  const body = await response.json().catch(() => null) as { success?: boolean; data?: T; errors?: ErrorItem[] } | null
  if (!response.ok || !body?.success || body.data === undefined) throw new ApiError(response.status, body?.errors)
  return body.data
}

function query(params: object) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  return search.size ? `?${search}` : ''
}

export const api = {
  login: (input: LoginRequest) => request<LoginResponseData>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  books: (params: BooksQueryParams = {}, signal?: AbortSignal) => request<BookListResponseData>(`/books${query(params)}`, { signal }),
  book: (id: number, signal?: AbortSignal) => request<Book>(`/books/${id}`, { signal }),
  createBook: (form: FormData) => request<Book>('/books', { method: 'POST', body: form }),
  updateBook: (id: number, form: FormData) => request<Book>(`/books/${id}`, { method: 'PUT', body: form }),
  patchBook: (id: number, input: BookInput) => request<Book>(`/books/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteBook: (id: number) => request<void>(`/books/${id}`, { method: 'DELETE' }),
  authors: (params: AuthorsQueryParams = {}, signal?: AbortSignal) => request<AuthorListResponseData>(`/authors${query(params)}`, { signal }),
  author: (id: number, signal?: AbortSignal) => request<Author>(`/authors/${id}`, { signal }),
  createAuthor: (input: AuthorInput) => request<Author>('/authors', { method: 'POST', body: JSON.stringify(input) }),
  updateAuthor: (id: number, input: AuthorInput) => request<Author>(`/authors/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  deleteAuthor: (id: number) => request<void>(`/authors/${id}`, { method: 'DELETE' }),
  topAuthors: (year: number, signal?: AbortSignal) => request<TopAuthorsResponseData>(`/reports/top-authors${query({ year })}`, { signal }),
}
