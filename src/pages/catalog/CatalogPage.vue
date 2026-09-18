<template>
  <main class="page-layout catalog-page">
    <PageHeader title="Все книги">
      <template #actions>
        <RouterLink v-if="isAuthenticated" class="ui-button" :to="{ name: 'bookCreate' }">Добавить книгу</RouterLink>
      </template>
    </PageHeader>
    <Divider />
    <form class="catalog-filters" @submit.prevent="applyFilters">
      <label>Поиск<input v-model="search" type="search" placeholder="Название, описание или ISBN" /></label>
      <label>Год<input v-model="year" type="number" min="1" max="9999" placeholder="Все годы" /></label>
      <label>Автор
        <select v-model="authorId">
          <option value="">Все авторы</option>
          <option v-for="author in authors" :key="author.id" :value="String(author.id)">{{ author.full_name }}</option>
        </select>
      </label>
      <button type="submit" class="ui-button">Найти</button>
      <button type="button" class="ui-button" @click="router.push({ name: 'catalog' })">Сбросить</button>
    </form>
    <p v-if="authorsError" role="alert">{{ authorsError }} <button class="ui-button" @click="reloadAuthors">Повторить загрузку авторов</button></p>
    <p v-if="loading" role="status">Загружаем книги…</p>
    <div v-else-if="error" role="alert"><p>{{ error }}</p><button class="ui-button" @click="refresh">Повторить</button></div>
    <template v-else>
      <BooksList v-if="result?.items?.length" :books="result.items" />
      <p v-else role="status">Книги не найдены.</p>
      <nav v-if="(result?.pagination?.total_pages ?? 0) > 1" class="pagination" aria-label="Страницы каталога">
        <button class="ui-button" :disabled="page <= 1" @click="changePage(page - 1)">Назад</button>
        <span>{{ page }} из {{ result?.pagination?.total_pages }}</span>
        <button class="ui-button" :disabled="page >= (result?.pagination?.total_pages ?? 1)" @click="changePage(page + 1)">Далее</button>
      </nav>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BooksList from '@/components/books-list/BooksList.vue'
import Divider from '@/components/divider/Divider.vue'
import PageHeader from '@/components/page-header/PageHeader.vue'
import { api } from '@/services/api'
import { isAuthenticated } from '@/services/session'
import { useApiResource } from '@/composables/use-api-resource'
import type { AuthorShort } from '@/types'

const route = useRoute()
const router = useRouter()
const search = ref('')
const year = ref<string | number>('')
const authorId = ref('')
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
watch(() => route.query, query => {
  search.value = typeof query.search === 'string' ? query.search : ''
  year.value = typeof query.year === 'string' ? query.year : ''
  authorId.value = typeof query.author_id === 'string' ? query.author_id : ''
}, { immediate: true })

const { data: result, loading, error, refresh } = useApiResource(signal => api.books({
  search: typeof route.query.search === 'string' ? route.query.search : undefined,
  year: Number(route.query.year) || undefined,
  author_id: Number(route.query.author_id) || undefined,
  page: page.value,
  'per-page': 12,
}, signal), () => route.fullPath)

const { data: authors, error: authorsError, refresh: reloadAuthors } = useApiResource(async signal => {
  const items: AuthorShort[] = []
  let page = 1
  let totalPages = 1
  do {
    const result = await api.authors({ page, 'per-page': 100 }, signal)
    items.push(...result.items ?? [])
    totalPages = result.pagination?.total_pages ?? 1
  } while (++page <= totalPages)
  return items
})

function applyFilters() {
  void router.push({ name: 'catalog', query: {
    search: search.value.trim() || undefined,
    year: year.value || undefined,
    author_id: authorId.value || undefined,
  } })
}
function changePage(next: number) {
  void router.push({ name: 'catalog', query: { ...route.query, page: next } })
}
</script>

<style scoped>
.catalog-page { text-align: left; }
.catalog-filters { display: flex; align-items: end; flex-wrap: wrap; gap: 12px; margin: 24px 0; }
.catalog-filters label { display: flex; flex-direction: column; gap: 6px; font-size: 14px; max-width: 100%; }
.catalog-filters input, .catalog-filters select { box-sizing: border-box; max-width: 100%; min-height: 44px; padding: 8px; border: 1px solid var(--border); border-radius: 8px; color: var(--text-h); background: var(--bg); font: inherit; }
.pagination { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 16px; margin-top: 24px; }
</style>
