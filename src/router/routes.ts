import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router"
import { getToken } from '@/services/session'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../pages/home/HomePage.vue'),
    name: 'home',
  },
  {
    path: '/catalog',
    component: () => import('../pages/catalog/CatalogPage.vue'),
    name: 'catalog',
  },
  {
    path: '/my-books',
    component: () => import('../pages/my-books/MyBooksPage.vue'),
    name: 'myBooks',
    meta: { requiresAuth: true },
  },
  {
    path: '/books/new',
    component: () => import('../pages/book/BookEditorPage.vue'),
    name: 'bookCreate',
    meta: { requiresAuth: true },
  },
  {
    path: '/book/:id/edit',
    component: () => import('../pages/book/BookEditorPage.vue'),
    name: 'bookEdit',
    meta: { requiresAuth: true },
  },
  {
    path: '/book/:id',
    component: () => import('../pages/book/BookPage.vue'),
    name: 'bookPage',
  },
  {
    path: '/auth',
    component: () => import('../pages/auth/AuthPage.vue'),
    name: 'auth',
    props: route => ({ isRegister: route.query.isRegister === 'true' }),
  },
  {
    path: '/profile',
    component: () => import('../pages/profile/ProfilePage.vue'),
    name: 'profile',
    meta: { requiresAuth: true },
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})

router.beforeEach(to => {
  if (to.meta.requiresAuth && !getToken()) {
    return { name: 'auth', query: { isRegister: 'false', redirect: to.fullPath } }
  }
})
