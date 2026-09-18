<template>
  <header class="page-header">
    <h1 class="page-header__title">{{ title }}</h1>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
}>()
</script>

<style scoped lang="scss">
.page-header {
  text-align: left;
}

.page-header__title {
  margin: 0;
  max-width: 850px;
  font-size: clamp(24px, 3vw, 32px);
  line-height: 1.25;
  letter-spacing: -0.5px;
}

.page-header__actions {
  margin-top: 12px;
}
</style>
