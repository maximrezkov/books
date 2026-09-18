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
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isAuthenticated } from '@/services/session';

const route = useRoute()
const router = useRouter()
watch(isAuthenticated, authenticated => {
  if (!authenticated && route.meta.requiresAuth) {
    void router.replace({ name: 'auth', query: { isRegister: 'false', redirect: route.fullPath } })
  }
})

</script>
