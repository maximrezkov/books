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

    <p v-if="loading" role="status">Загружаем авторов…</p>
    <div v-else-if="error" role="alert">
      <p>{{ error }}</p>
      <button class="ui-button" type="button" @click="refresh">Повторить</button>
    </div>
    <p v-else-if="!topAuthors?.length" role="status">За {{ selectedYear }} год книги не найдены.</p>

    <section
      v-for="author in topAuthors"
      :key="author.author_id"
      class="author-section"
      :aria-labelledby="`author-${author.author_id}`"
    >
      <h2 :id="`author-${author.author_id}`" class="author-section__title">
        <RouterLink :to="{ name: 'catalog', query: { author_id: author.author_id, year: selectedYear } }" class="author-section__link">
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
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import BooksList from '@/components/books-list/BooksList.vue'
import PageHeader from '@/components/page-header/PageHeader.vue'
import { api } from '@/services/api'
import { useApiResource } from '@/composables/use-api-resource'

const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const years = Array.from({ length: 10 }, (_, index) => currentYear - index)

const { data: topAuthors, loading, error, refresh } = useApiResource(async signal => {
  const year = selectedYear.value
  const report = await api.topAuthors(year, signal)
  return Promise.all((report.items ?? []).slice(0, 10).map(async author => {
    const books = author.author_id == null ? [] : (await api.books({ author_id: author.author_id, year, 'per-page': 8 }, signal)).items ?? []
    return { ...author, books }
  }))
}, () => selectedYear.value)
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
