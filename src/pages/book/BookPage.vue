<template>
  <main class="page-layout book-page">
    <p v-if="loading" role="status">Загружаем книгу…</p>
    <div v-else-if="error" role="alert">
      <PageHeader :title="status === 404 ? 'Книга не найдена' : 'Не удалось загрузить книгу'" />
      <p>{{ error }}</p>
      <button v-if="status !== 404" class="ui-button" @click="refresh">Повторить</button>
      <RouterLink class="ui-button" :to="{ name: 'catalog' }">В каталог</RouterLink>
    </div>
    <article v-else-if="book" class="book-details">
      <div class="book-details__artwork">
        <img
          v-if="book.cover_url && !coverFailed"
          :src="book.cover_url"
          :alt="`Обложка книги «${book.title || 'Без названия'}»`"
          class="book-details__cover"
          @error="coverFailed = true"
        />
        <div v-else class="book-details__placeholder">
          <span>Обложка отсутствует</span>
        </div>
      </div>

      <div class="book-details__info">
        <PageHeader :title="book.title || 'Без названия'">
          <template v-if="isAuthenticated" #actions>
            <div class="book-details__actions">
              <RouterLink class="ui-button" :to="{ name: 'bookEdit', params: { id: book.id } }">Редактировать</RouterLink>
              <button class="ui-button" :disabled="deleting" @click="confirmDelete = true">Удалить</button>
            </div>
          </template>
        </PageHeader>
        <div v-if="confirmDelete && isAuthenticated" class="book-details__delete" role="group" aria-label="Удаление книги">
          <p>Удалить книгу «{{ book.title }}»?</p>
          <button class="ui-button" :disabled="deleting" @click="deleteBook">{{ deleting ? 'Удаляем…' : 'Подтвердить удаление' }}</button>
          <button class="ui-button" :disabled="deleting" @click="confirmDelete = false">Отмена</button>
        </div>
        <p v-if="deleteError" role="alert" class="ui-error">{{ deleteError }}</p>

        <dl class="book-details__metadata">
          <div>
            <dt>Авторы</dt>
            <dd>{{ authors || 'Не указаны' }}</dd>
          </div>
          <div>
            <dt>Год выпуска</dt>
            <dd>{{ book.year ?? 'Не указан' }}</dd>
          </div>
          <div>
            <dt>ISBN</dt>
            <dd>{{ book.isbn || 'Не указан' }}</dd>
          </div>
        </dl>

        <section class="book-details__description" aria-labelledby="book-description">
          <h2 id="book-description">Описание</h2>
          <p>{{ book.description || 'Описание пока не добавлено.' }}</p>
        </section>
      </div>
    </article>
  </main>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/page-header/PageHeader.vue'
import { api, ApiError, errorMessage } from '@/services/api'
import { isAuthenticated } from '@/services/session'
import { useApiResource } from '@/composables/use-api-resource'

const route = useRoute()
const router = useRouter()
const { data: book, loading, error, status, refresh } = useApiResource(signal => {
  const id = Number(route.params.id)
  if (!Number.isInteger(id) || id < 1) throw new ApiError(404)
  return api.book(id, signal)
}, () => route.params.id)
const authors = computed(() => book.value?.authors?.map(author => author.full_name).filter(Boolean).join(', '))
const coverFailed = ref(false)
const confirmDelete = ref(false)
const deleting = ref(false)
const deleteError = ref('')
watch(book, () => {
  coverFailed.value = false
  confirmDelete.value = false
  deleteError.value = ''
})

async function deleteBook() {
  if (!isAuthenticated.value || book.value?.id == null || deleting.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await api.deleteBook(book.value.id)
    await router.push({ name: 'catalog' })
  } catch (error) {
    deleteError.value = errorMessage(error)
  } finally {
    deleting.value = false
  }
}
</script>

<style lang="scss" scoped>
.book-page {
  text-align: left;
}

.book-details {
  display: grid;
  grid-template-columns: minmax(0, 400px) minmax(0, 1fr);
  align-items: start;
  gap: 32px;
}

.book-details__artwork {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: linear-gradient(145deg, var(--accent-bg), var(--social-bg));
}

.book-details__cover {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.book-details__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  color: var(--accent);
  text-align: center;

}

.book-details__actions { display: flex; flex-wrap: wrap; gap: 12px; }
.book-details__delete { margin-top: 20px; }

.book-details__info {
  min-width: 0;
  overflow-wrap: anywhere;
}

.book-details__metadata {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 28px 0;

  div {
    display: grid;
    grid-template-columns: 120px minmax(0, 1fr);
    gap: 16px;
  }

  dd {
    margin: 0;
    color: var(--text-h);
  }
}

.book-details__description p {
  margin-top: 12px;
  line-height: 1.6;
  white-space: pre-line;
}

@media (max-width: 768px) {
  .book-details {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }
}

@media (max-width: 480px) {
  .book-page {
    padding: 24px 16px;
  }

  .book-details__metadata div {
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
  }
}
</style>
