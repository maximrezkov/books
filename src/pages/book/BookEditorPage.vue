<template>
  <main class="page-layout editor-page">
    <PageHeader :title="isEditing ? 'Редактировать книгу' : 'Добавить книгу'" />
    <p v-if="loading" role="status">Загружаем данные…</p>
    <div v-else-if="error" role="alert"><p>{{ error }}</p><button class="ui-button" @click="refresh">Повторить</button></div>
    <form v-else-if="data" class="book-form" @submit.prevent="save">
      <fieldset :disabled="saving || !isAuthenticated">
        <label>Название<input v-model.trim="title" required maxlength="255" /></label>
        <label>Год выпуска<input v-model.number="year" type="number" min="1" max="9999" required /></label>
        <label>Описание<textarea v-model="description" rows="5" /></label>
        <label>ISBN<input v-model.trim="isbn" /></label>
        <fieldset class="book-form__authors">
          <legend>Авторы</legend>
          <label v-for="author in data.authors" :key="author.id" class="book-form__checkbox">
            <input v-model="authorIds" type="checkbox" :value="author.id" />{{ author.full_name }}
          </label>
          <p v-if="!data.authors.length">Пока нет авторов. Добавьте первого.</p>
          <div class="book-form__new-author">
            <label>Новый автор<input v-model.trim="newAuthor" placeholder="ФИО автора" /></label>
            <button class="ui-button" type="button" :disabled="addingAuthor || !newAuthor" @click="addAuthor">{{ addingAuthor ? 'Добавляем…' : 'Добавить автора' }}</button>
          </div>
          <p v-if="authorError" class="ui-error" role="alert">{{ authorError }}</p>
        </fieldset>
        <label>Обложка<input type="file" accept="image/*" :required="!isEditing" @change="selectCover" /></label>
        <p v-if="isEditing">Оставьте поле пустым, чтобы сохранить текущую обложку.</p>
        <p v-if="saveError" class="ui-error" role="alert">{{ saveError }}</p>
        <div class="book-form__actions">
          <button class="ui-button" type="submit" :disabled="addingAuthor">{{ saving ? 'Сохраняем…' : 'Сохранить' }}</button>
          <RouterLink class="ui-button" :to="isEditing ? { name: 'bookPage', params: { id: route.params.id } } : { name: 'catalog' }">Отмена</RouterLink>
        </div>
      </fieldset>
    </form>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/page-header/PageHeader.vue'
import { api, errorMessage } from '@/services/api'
import { isAuthenticated } from '@/services/session'
import { useApiResource } from '@/composables/use-api-resource'
import type { AuthorShort, BookInput } from '@/types'

const route = useRoute()
const router = useRouter()
const isEditing = computed(() => route.name === 'bookEdit')
const title = ref('')
const year = ref(new Date().getFullYear())
const description = ref('')
const isbn = ref('')
const authorIds = ref<number[]>([])
const cover = ref<File>()
const newAuthor = ref('')
const addingAuthor = ref(false)
const authorError = ref('')
const saving = ref(false)
const saveError = ref('')

const { data, loading, error, refresh } = useApiResource(async signal => {
  const book = isEditing.value ? await api.book(Number(route.params.id), signal) : undefined
  const authors: AuthorShort[] = []
  let page = 1
  let totalPages = 1
  do {
    const result = await api.authors({ page, 'per-page': 100 }, signal)
    authors.push(...result.items ?? [])
    totalPages = result.pagination?.total_pages ?? 1
  } while (++page <= totalPages)
  return { book, authors }
}, () => route.fullPath)

watch(data, (value, previous) => {
  if (!value || (previous && previous.book === value.book)) return
  title.value = value.book?.title ?? ''
  year.value = value.book?.year ?? new Date().getFullYear()
  description.value = value.book?.description ?? ''
  isbn.value = value.book?.isbn ?? ''
  authorIds.value = value.book?.authors?.flatMap(author => author.id == null ? [] : [author.id]) ?? []
  cover.value = undefined
  saveError.value = ''
})

function selectCover(event: Event) {
  cover.value = (event.target as HTMLInputElement).files?.[0]
}

async function addAuthor() {
  if (!newAuthor.value || addingAuthor.value || !isAuthenticated.value) return
  addingAuthor.value = true
  authorError.value = ''
  try {
    const author = await api.createAuthor({ full_name: newAuthor.value })
    if (data.value) data.value = { ...data.value, authors: [...data.value.authors, author] }
    // Список не перезагружаем, чтобы не потерять заполненную форму.
    if (author.id != null) authorIds.value.push(author.id)
    newAuthor.value = ''
  } catch (error) {
    authorError.value = errorMessage(error)
  } finally {
    addingAuthor.value = false
  }
}

async function save() {
  if (saving.value || !isAuthenticated.value) return
  saveError.value = ''
  if (!title.value || !Number.isInteger(year.value) || !authorIds.value.length) {
    saveError.value = 'Укажите название, год и хотя бы одного автора.'
    return
  }
  saving.value = true
  const fields: BookInput = { title: title.value, year: year.value, description: description.value, isbn: isbn.value, author_ids: authorIds.value }
  try {
    let book
    if (isEditing.value && !cover.value) {
      book = await api.patchBook(Number(route.params.id), fields)
    } else {
      const form = new FormData()
      form.set('title', title.value)
      form.set('year', String(year.value))
      form.set('description', description.value)
      form.set('isbn', isbn.value)
      form.set('author_ids', JSON.stringify(authorIds.value))
      if (cover.value) form.set('cover', cover.value)
      book = isEditing.value ? await api.updateBook(Number(route.params.id), form) : await api.createBook(form)
    }
    await router.push({ name: 'bookPage', params: { id: book.id } })
  } catch (error) {
    saveError.value = errorMessage(error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.editor-page { text-align: left; }
.book-form { max-width: 640px; margin-top: 24px; }
.book-form fieldset { display: flex; flex-direction: column; gap: 18px; min-width: 0; padding: 0; margin: 0; border: 0; }
.book-form label { display: flex; flex-direction: column; gap: 8px; }
.book-form input:not([type=checkbox]), .book-form textarea { box-sizing: border-box; width: 100%; min-height: 44px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; font: inherit; color: var(--text-h); background: var(--bg); }
.book-form .book-form__authors { padding: 16px; border: 1px solid var(--border); border-radius: 8px; }
.book-form .book-form__checkbox { flex-direction: row; align-items: center; }
.book-form input[type=checkbox] { width: 20px; height: 20px; accent-color: var(--accent); }
.book-form__new-author, .book-form__actions { display: flex; align-items: end; flex-wrap: wrap; gap: 12px; }
</style>
