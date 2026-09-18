<template>
  <article class="book-card">
    <RouterLink :to="to" class="book-card__link">
      <div class="book-card__artwork">
        <img
          v-if="cover && !coverFailed"
          :key="cover"
          :src="cover"
          alt=""
          class="book-card__cover"
          loading="lazy"
          decoding="async"
          @error="coverFailed = true"
        />

        <div v-else class="book-card__placeholder" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z" />
            <path d="M12 6v14" />
          </svg>
          <span>{{ title }}</span>
        </div>
      </div>

      <div class="book-card__info">
        <h3 class="book-card__title">{{ title }}</h3>
        <p class="book-card__author">{{ author }}</p>
        <span
          v-if="rating != null"
          class="book-card__rating"
          :aria-label="`Оценка ${rating} из 5`"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9Z" />
          </svg>
          {{ rating.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) }}
        </span>
      </div>
    </RouterLink>

    <div v-if="$slots.action" class="book-card__action">
      <slot name="action" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  title: string
  author: string
  to: RouteLocationRaw
  cover?: string
  rating?: number
}>()

const coverFailed = ref(false)

watch(() => props.cover, () => { coverFailed.value = false })
</script>

<style scoped>
.book-card {
  position: relative;
  min-width: 0;
  width: 100%;
  color: var(--text);
  font-family: var(--sans);
  text-align: left;
}

.book-card__link {
  display: flex;
  flex-direction: column;
  gap: var(--book-card-gap, 14px);
  height: 100%;
  color: inherit;
  text-decoration: none;
  border-radius: 18px;
}

.book-card__artwork {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 3 / 4;
  padding: 22px;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: linear-gradient(145deg, var(--accent-bg), var(--social-bg));
  transition: border-color 180ms ease, background-color 180ms ease;
}

.book-card__cover,
.book-card__placeholder {
  position: absolute;
  inset: 22px;
  width: calc(100% - 44px);
  height: calc(100% - 44px);
  min-height: 0;
  min-width: 0;
  transition: transform 220ms ease;
}

.book-card__cover {
  object-fit: contain;
  filter: drop-shadow(0 8px 8px rgb(0 0 0 / 18%));
}

.book-card__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 12px;
  box-sizing: border-box;
  border: 1px solid var(--accent-border);
  border-radius: 4px 10px 10px 4px;
  background: var(--bg);
  color: var(--accent);
  text-align: center;
  box-shadow: var(--shadow);
}

.book-card__placeholder svg { width: 36px; height: 36px; flex-shrink: 0; }
.book-card__placeholder span { font-size: 15px; line-height: 1.35; }

.book-card__info { display: flex; flex-direction: column; gap: 5px; }
.book-card__title {
  margin: 0;
  color: var(--text-h);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.35;
  transition: color 180ms ease;
}
.book-card__author { margin: 0; font-size: 13px; line-height: 1.45; }
.book-card__title,
.book-card__author,
.book-card__placeholder span {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
}
.book-card__rating {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 3px;
  color: var(--text-h);
  font-size: 12px;
  font-weight: 600;
}
.book-card__rating svg { width: 15px; height: 15px; color: var(--accent); }

.book-card__action {
  position: absolute;
  z-index: 2;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
}

.book-card__link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.book-card__link:hover .book-card__artwork { border-color: var(--accent-border); }
.book-card__link:hover .book-card__cover,
.book-card__link:hover .book-card__placeholder { transform: translateY(-4px) rotate(-1deg); }
.book-card__link:hover .book-card__title { color: var(--accent); }

</style>
