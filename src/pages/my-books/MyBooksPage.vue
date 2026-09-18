<template>
  <main class="page-layout my-books-page">
    <PageHeader title="Мои книги" />
    <Divider />
    <p>Личная библиотека пока недоступна.</p>
    <RouterLink class="ui-button" :to="{ name: 'catalog' }">Перейти в каталог</RouterLink>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Divider from '@/components/divider/Divider.vue'
import PageHeader from '@/components/page-header/PageHeader.vue'
</script>

<style scoped>
.my-books-page { text-align: left; }
.my-books-page .ui-button { margin-top: 20px; }
</style>
