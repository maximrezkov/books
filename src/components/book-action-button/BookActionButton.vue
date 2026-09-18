<template>
  <button
    type="button"
    class="book-action-button"
    :class="{ 'book-action-button--selected': selected }"
    :aria-pressed="selected"
    @click="selected = !selected"
  >
    <svg
      v-if="action === 'favorite'"
      viewBox="0 0 24 24"
      :fill="selected ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>

    <svg
      v-else
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h13v18ZM3 18a3 3 0 0 1 3-3h13" />
      <path v-if="selected" d="m8 9 2 2 4-4" />
      <path v-else d="M8 9h6m-3-3v6" />
    </svg>
  </button>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  action?: 'library' | 'favorite'
}>(), {
  action: 'favorite',
})

const selected = defineModel<boolean>({ default: false })
</script>

<style scoped lang="scss">
.book-action-button {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  padding: 0;
  box-sizing: border-box;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  transition: color 180ms ease, border-color 180ms ease;

  &:hover {
    color: var(--accent);
    border-color: var(--accent-border);
  }
}

.book-action-button svg { width: 19px; height: 19px; }

.book-action-button--selected {
  color: var(--accent);
  border-color: var(--accent-border);
}


</style>
