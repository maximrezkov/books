<template>
  <main class="page-layout profile-page">
    <PageHeader title="Профиль" />

    <div class="profile-notifications">
      <label class="profile-notifications__toggle">
        <input v-model="smsEnabled" type="checkbox" aria-controls="sms-phone-field" />
        <span>Получать уведомления по СМС</span>
      </label>

      <div v-if="smsEnabled" id="sms-phone-field" class="profile-notifications__field">
        <label for="sms-phone">Номер телефона</label>
        <input
          id="sms-phone"
          :value="phone"
          name="phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="+7-999-999-99-99"
          @input="formatPhone"
        />
      </div>

      <button type="button" class="profile-notifications__confirm" :disabled="isConfirmDisabled">
        Подтвердить
      </button>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import PageHeader from '@/components/page-header/PageHeader.vue'

const smsEnabled = ref(false)
const phone = ref('')

const isConfirmDisabled = computed(() => !/^\+7-\d{3}-\d{3}-\d{2}-\d{2}$/.test(phone.value))

function formatPhone(event: Event) {
  const input = event.target as HTMLInputElement
  let digits = input.value.replace(/\D/g, '')

  if (input.value.startsWith('+7') || (digits.length > 10 && /^[78]/.test(digits))) {
    digits = digits.slice(1)
  }

  digits = digits.slice(0, 10)
  const groups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)]
  phone.value = digits ? `+7-${groups.filter(Boolean).join('-')}` : ''
  input.value = phone.value
}

</script>

<style lang="scss" scoped>
.profile-page {
  text-align: left;
}

.profile-notifications {
  margin-top: 28px;
}

.profile-notifications__toggle {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  color: var(--text-h);
  cursor: pointer;

  input {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    margin: 0;
    accent-color: var(--accent);

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
    }
  }
}

.profile-notifications__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 420px;
  margin-top: 20px;

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
  }
}

.profile-notifications__confirm {
  display: block;
  margin-top: 24px;
  min-height: 44px;
  padding: 10px 18px;
  border: 1px solid var(--accent-border);
  border-radius: 12px;
  background: var(--accent-bg);
  color: var(--accent);
  font: inherit;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
}
</style>
