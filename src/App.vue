<template>
  <div>
    <Layout>
      <template #header>
        <Header/>
      </template>
      <template #content>
        <RouterView/>
      </template>
    </Layout>
  </div>
</template>


<script setup lang="ts">
import Header from './components/header/Header.vue';
import Layout from './components/layout/Layout.vue';

</script>
