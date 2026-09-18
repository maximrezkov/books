<template>
  <main class="page-layout">
    <PageHeader title="Все книги"></PageHeader>
    <Divider/>
    <BooksList :books/>
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
