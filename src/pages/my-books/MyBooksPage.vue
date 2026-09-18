<template>
  <main class="page-layout">
    <PageHeader title="Мои книги"></PageHeader>
    <Divider/>
    <BooksList :books is-my/>
  </main>
</template>

<script lang="ts" setup>
import BooksList from '@/components/books-list/BooksList.vue';
import Divider from '@/components/divider/Divider.vue';
import PageHeader from '@/components/page-header/PageHeader.vue';
import type { Book } from '@/types';

const books: Book[] = [
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {},
]
</script>

<style lang="scss">
</style>
