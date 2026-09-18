import { createApp } from 'vue'
import './style.css'
import './styles/common.css'
import App from './App.vue'
import { router } from './router'
import { restoreSession } from './services/session'

async function start() {
  if (import.meta.env.VITE_ENABLE_MSW === 'true' || (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW !== 'false')) {
    const { startMockApi } = await import('../backend/book.mock')
    await startMockApi()
  }
  restoreSession()
  window.addEventListener('focus', restoreSession)
  const app = createApp(App)
  app.use(router)
  await router.isReady()
  app.mount('#app')
}

start().catch(error => {
  console.error('Не удалось запустить приложение', error)
  const root = document.getElementById('app')
  if (root) root.textContent = 'Не удалось запустить приложение. Обновите страницу.'
})
