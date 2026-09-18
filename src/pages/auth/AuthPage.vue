<template>
  <main class="page-layout auth-page">
    <PageHeader :title="isRegister ? 'Регистрация' : 'Вход'" />

    <form class="auth-form" @submit.prevent="handleSubmit">
      <div class="auth-form__field">
        <label for="auth-login">Логин</label>
        <input
          id="auth-login"
          v-model.trim="login"
          name="username"
          type="text"
          autocomplete="username"
          required
        />
      </div>

      <div class="auth-form__field">
        <label for="auth-password">Пароль</label>
        <input
          id="auth-password"
          v-model="password"
          name="password"
          type="password"
          :autocomplete="isRegister ? 'new-password' : 'current-password'"
          required
        />
      </div>

      <div v-if="isRegister" class="auth-form__field">
        <label for="auth-repeat-password">Повторите пароль</label>
        <input
          id="auth-repeat-password"
          ref="repeatPasswordInput"
          v-model="repeatPassword"
          name="repeat-password"
          type="password"
          autocomplete="new-password"
          required
          :aria-invalid="showPasswordError"
          :aria-describedby="showPasswordError ? 'auth-password-error' : undefined"
          @blur="repeatPasswordTouched = true"
        />
        <p v-if="showPasswordError" id="auth-password-error" class="auth-form__error" role="alert">
          Пароли не совпадают.
        </p>
      </div>

      <button type="submit" class="auth-form__submit">
        {{ isRegister ? 'Зарегистрироваться' : 'Войти' }}
      </button>
    </form>
  </main>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import PageHeader from '@/components/page-header/PageHeader.vue'

const props = withDefaults(defineProps<{
  isRegister?: boolean
}>(), {
  isRegister: false,
})

const login = ref('')
const password = ref('')
const repeatPassword = ref('')
const repeatPasswordTouched = ref(false)
const repeatPasswordInput = ref<HTMLInputElement | null>(null)

const showPasswordError = computed(() =>
  props.isRegister && repeatPasswordTouched.value && password.value !== repeatPassword.value,
)

function handleSubmit() {
  repeatPasswordTouched.value = true

  if (showPasswordError.value) {
    repeatPasswordInput.value?.focus()
    return
  }
}

watch(() => props.isRegister, () => {
  password.value = ''
  repeatPassword.value = ''
  repeatPasswordTouched.value = false
})
</script>

<style lang="scss" scoped>
.auth-page {
  text-align: left;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 420px;
  margin-top: 28px;
}

.auth-form__field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    color: var(--text-h);
    font-size: 16px;
  }

  input {
    box-sizing: border-box;
    width: 100%;
    min-height: 44px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text-h);
    font: inherit;

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    &[aria-invalid='true'] {
      border-color: var(--auth-error);
    }
  }
}

.auth-form {
  --auth-error: #c62828;
}

.auth-form__error {
  margin: 0;
  color: var(--auth-error);
  font-size: 14px;
}

.auth-form__submit {
  align-self: flex-start;
  min-height: 44px;
  padding: 10px 18px;
  border: 1px solid var(--accent-border);
  border-radius: 12px;
  background: var(--accent-bg);
  color: var(--accent);
  font: inherit;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    border-color: var(--accent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
}

@media (prefers-color-scheme: dark) {
  .auth-form {
    --auth-error: #ff8a80;
  }
}
</style>
