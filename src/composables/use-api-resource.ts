import { onScopeDispose, ref, shallowRef, watch, type WatchSource } from 'vue'
import { ApiError, errorMessage } from '@/services/api'

export function useApiResource<T>(load: (signal: AbortSignal) => Promise<T>, source: WatchSource = () => null) {
  const data = shallowRef<T>()
  const loading = ref(false)
  const error = ref('')
  const status = ref<number>()
  let controller: AbortController | undefined

  async function refresh() {
    controller?.abort()
    const active = new AbortController()
    controller = active
    loading.value = true
    error.value = ''
    status.value = undefined
    data.value = undefined
    try {
      const result = await load(active.signal)
      if (!active.signal.aborted) data.value = result
    } catch (cause) {
      if (!active.signal.aborted) {
        error.value = errorMessage(cause)
        status.value = cause instanceof ApiError ? cause.status : undefined
      }
    } finally {
      if (!active.signal.aborted) loading.value = false
    }
  }

  watch(source, () => { void refresh() }, { immediate: true })
  onScopeDispose(() => controller?.abort())
  return { data, loading, error, status, refresh }
}
