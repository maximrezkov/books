<template>
  <main class="page-layout home-page">
    <PageHeader title="Топ-10 авторов по количеству выпускаемых произведений">
      <template #actions>
        <div class="year-filter">
          <label for="report-year">Выбрать год</label>
          <select id="report-year" v-model.number="selectedYear" class="year-filter__select">
            <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
      </template>
    </PageHeader>

    <p v-if="!topAuthors.length" role="status">За {{ selectedYear }} год книги не найдены.</p>

    <section
      v-for="author in topAuthors"
      :key="author.id"
      class="author-section"
      :aria-labelledby="`author-${author.id}`"
    >
      <h2 :id="`author-${author.id}`" class="author-section__title">
        <RouterLink :to="{ name: 'home' }" class="author-section__link">
          {{ author.full_name }}
          <svg
            class="author-section__chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m9 5 7 7-7 7" />
          </svg>
        </RouterLink>
      </h2>
      <BooksList :books="author.books.slice(0, 8)" />
    </section>
  </main>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BooksList from '@/components/books-list/BooksList.vue'
import PageHeader from '@/components/page-header/PageHeader.vue'
import type { Book } from '@/types'
import { demoBooks, demoReportYear } from './demo-books'

const selectedYear = ref(demoReportYear)
const years = Array.from({ length: 10 }, (_, index) => demoReportYear - index)

const topAuthors = computed(() => {
  const authors = new Map<number, { id: number; full_name: string; books: Book[] }>()

  for (const book of demoBooks.filter(book => book.year === selectedYear.value)) {
    for (const author of book.authors ?? []) {
      if (author.id == null || !author.full_name) continue

      if (!authors.has(author.id)) {
        authors.set(author.id, { id: author.id, full_name: author.full_name, books: [] })
      }

      authors.get(author.id)!.books.push(book)
    }
  }

  return [...authors.values()]
    .sort((first, second) => second.books.length - first.books.length)
    .slice(0, 10)
})
</script>

<style scoped lang="scss">
.home-page {
  display: flex;
  flex-direction: column;
  gap: 40px;
  text-align: left;
}

.year-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.year-filter__select {
  min-width: 110px;
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  font: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
}

.author-section__title {
  margin: 0 0 20px;
}

.author-section__link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: 100%;
  border-radius: 4px;
  color: inherit;
  text-decoration: none;
  transition: color 180ms ease;

  &:hover {
    color: var(--accent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 5px;
  }
}

.author-section__chevron {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .home-page {
    padding: 24px 16px;
    gap: 32px;
  }
}
</style>
