import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router"

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
  },
  {
    path: '/book/:id',
    component: () => import('../pages/book/BookPage.vue'),
    name: 'bookPage',
  },
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes,
})