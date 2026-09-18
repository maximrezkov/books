<template>
  <div class="header-actions">
    <button v-if="isAuthenticated" type="button" class="header-actions__button" @click="logout">
      Выйти
    </button>
    <RouterLink
      v-else
      :to="{ name: 'auth', query: { isRegister: 'false' } }"
      class="header-actions__button"
    >
      Войти
    </RouterLink>
    <RouterLink v-if="isAuthenticated" to="/profile" class="header-actions__button">
      Профиль
    </RouterLink>
    <RouterLink
      v-else
      :to="{ name: 'auth', query: { isRegister: 'true' } }"
      class="header-actions__button"
    >
      Регистрация
    </RouterLink>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink, useRouter } from 'vue-router';
import { clearSession, isAuthenticated } from '@/services/session';

const router = useRouter()
function logout() {
  clearSession()
  void router.push({ name: 'home' })
}
</script>

<style lang="scss" scoped>
.header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.header-actions__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  box-sizing: border-box;
  padding: 10px 18px;
  border: 1px solid var(--accent-border);
  border-radius: 12px;
  background: var(--accent-bg);
  color: var(--accent);
  font: inherit;
  font-weight: 500;
  line-height: 1.25;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 180ms ease, border-color 180ms ease;

  &:hover {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 20%, transparent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .header-actions__button {
    transition: none;
  }
}
</style>
