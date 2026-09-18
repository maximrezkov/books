import { computed, readonly, ref } from 'vue'
import type { LoginResponseData, LoginResponseDataUser } from '@/types'

const tokenKey = 'books_token'
const userKey = 'books_user'
const expiresKey = 'books_token_expires'
const token = ref('')
const user = ref<LoginResponseDataUser | null>(null)
let expiryTimer: ReturnType<typeof setTimeout> | undefined

function readCookie(name: string) {
  const value = document.cookie.split('; ').find(item => item.startsWith(`${name}=`))?.slice(name.length + 1)
  try { return value ? decodeURIComponent(value) : '' } catch { return '' }
}

function writeCookie(name: string, value: string, expires: Date) {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Expires=${expires.toUTCString()}${secure}`
}

export function clearSession() {
  clearTimeout(expiryTimer)
  token.value = ''
  user.value = null
  for (const name of [tokenKey, userKey, expiresKey]) writeCookie(name, '', new Date(0))
}

export function restoreSession() {
  clearTimeout(expiryTimer)
  const storedToken = readCookie(tokenKey)
  const expires = Number(readCookie(expiresKey))
  if (!storedToken || !Number.isFinite(expires) || expires <= Date.now()) {
    clearSession()
    return
  }
  token.value = storedToken
  try { user.value = JSON.parse(readCookie(userKey)) } catch { user.value = null }
  expiryTimer = setTimeout(restoreSession, Math.min(expires - Date.now(), 2_147_483_647))
}

export function saveSession(data: LoginResponseData) {
  if (!data.token) throw new Error('Сервер не вернул токен авторизации.')
  const expires = data.expires_at ? new Date(data.expires_at) : new Date(Date.now() + 3_600_000)
  if (!Number.isFinite(expires.getTime()) || expires.getTime() <= Date.now()) {
    throw new Error('Срок действия токена истёк. Попробуйте войти снова.')
  }
  writeCookie(tokenKey, data.token, expires)
  writeCookie(userKey, JSON.stringify(data.user ?? null), expires)
  writeCookie(expiresKey, String(expires.getTime()), expires)
  restoreSession()
}

export function getToken() {
  restoreSession()
  return token.value
}

export const isAuthenticated = computed(() => Boolean(token.value))
export const currentUser = readonly(user)
