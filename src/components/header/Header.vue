<template>
  <div class="header">
      <div class="header__list">
        <NavButton v-for="page in pages" :key="page.routeName" :to="{ name: page.routeName }">
          {{ page.title }}
        </NavButton>
      </div>
      <div class="actions"></div>
    </div>
</template>

<script lang="ts" setup>
import NavButton from '@/components/nav-button/NavButton.vue';


const pages = [
  {
    title: 'Главное',
    routeName: 'home',
  },
  {
    title: 'Каталог',
    routeName: 'catalog',
  },
  {
    title: 'Мои книги',
    routeName: 'myBooks',
  }
]
</script>

<style lang="scss">
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid var(--accent-border);
  padding-bottom: 20px;
  padding-top: 20px;
  padding-left: 15px;
  padding-right: 15px;

  &__list {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
