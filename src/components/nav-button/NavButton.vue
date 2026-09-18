<template>
  <RouterLink
    to="/books"
    class="nav-button"
    exact-active-class="nav-button--active"
  >
    <slot/>
  </RouterLink>
</template>

<style scoped>
.nav-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;

  font-weight: 500;
  line-height: 1.25;
  text-decoration: none;

  color: var(--accent);
  background: var(--accent-bg);
  border: 1px solid var(--accent-border);
  border-radius: 12px;

  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);

  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.nav-button:hover {
  background: color-mix(in srgb, var(--accent) 20%, transparent);
  border-color: var(--accent);
  box-shadow: var(--shadow);
}

.nav-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.nav-button:active {
  background: color-mix(in srgb, var(--accent) 28%, transparent);
}

.nav-button--active {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 22%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .nav-button {
    transition: none;
  }
}
</style>