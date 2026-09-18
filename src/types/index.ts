export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success?: boolean;
  data?: LoginResponseData;
}

export interface Book {
  id?: number;
  title?: string;
  year?: number;
  description?: string;
  isbn?: string;
  cover_url?: string;
  authors?: AuthorShort[];
}

export interface AuthorShort {
  id?: number;
  full_name?: string;
}

export interface Author {
  id?: number;
  full_name?: string;
  books?: BookShort[];
}

export interface BookShort {
  id?: number;
  title?: string;
  year?: number;
}

export interface BookInput {
  title?: string;
  year?: number;
  description?: string;
  isbn?: string;
  author_ids?: number[];
}

export interface BookForm {
  title: string;
  year: number;
  description?: string;
  isbn?: string;
  author_ids: number[];
  cover: File;
}

export interface AuthorInput {
  full_name: string;
}

export interface BookResponse {
  success?: boolean;
  data?: Book;
}

export interface AuthorResponse {
  success?: boolean;
  data?: Author;
}

export interface BookListResponse {
  success?: boolean;
  data?: BookListResponseData;
}

export interface AuthorListResponse {
  success?: boolean;
  data?: AuthorListResponseData;
}

export interface TopAuthorsResponse {
  success?: boolean;
  data?: TopAuthorsResponseData;
}

export interface TopAuthor {
  rank?: number;
  author_id?: number;
  full_name?: string;
  books_count?: number;
}

export interface Pagination {
  total?: number;
  page?: number;
  per_page?: number;
  total_pages?: number;
}

export interface Error {
  success?: boolean;
  errors?: ErrorItem[];
}

export interface ErrorItem {
  field?: string;
  message?: string;
}

export interface LoginResponseData {
  token?: string;
  expires_at?: string;
  user?: LoginResponseDataUser;
}

export interface BookListResponseData {
  items?: Book[];
  pagination?: Pagination;
}

export interface AuthorListResponseData {
  items?: AuthorShort[];
  pagination?: Pagination;
}

export interface TopAuthorsResponseData {
  year?: number;
  items?: TopAuthor[];
}

export interface LoginResponseDataUser {
  id?: number;
  username?: string;
  role?: string;
}

export interface BooksQueryParams {
  page?: number;
  'per-page'?: number;
  author_id?: number;
  year?: number;
  search?: string;
}

export interface AuthorsQueryParams {
  page?: number;
  'per-page'?: number;
  search?: string;
}

export interface TopAuthorsQueryParams {
  year: number;
}

export interface IdPathParams {
  id: number;
}
