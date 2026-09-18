<template>
  <div class="books-grid">
    <div v-for="(book, index) in books" :key="book.id ?? index" class="card-wrapp">
      <BookCard
        :author="book.authors?.map(author => author.full_name).filter(Boolean).join(', ') || 'Автор не указан'"
        :title="book.title || 'Без названия'"
        :cover="book.cover_url"
        :to="book.id != null ? { name: 'bookPage', params: { id: book.id } } : { name: 'catalog' }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Book } from '@/types';
import BookCard from '@/components/book-card/BookCard.vue';

const props = defineProps<{
  books: Book[],
}>()
</script>

<style lang="scss" scoped>
.books-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.card-wrapp {
  min-width: 0;
}

@media (max-width: 900px) {
  .books-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .books-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
}

@media (max-width: 380px) {
  .books-grid {
    grid-template-columns: 1fr;
  }
}
</style>
