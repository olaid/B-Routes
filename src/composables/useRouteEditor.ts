import { ref } from 'vue'
import type { Route } from '../types'
import { upsertRouteRecord } from '../lib/areasRepository'
import { isSupabaseConfigured } from '../lib/supabase'

export function useRouteEditor() {
  const saving = ref(false)
  const error = ref<string | null>(null)

  const saveRoute = async (route: Route & { wallId: string }) => {
    saving.value = true
    error.value = null
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase が未設定です。.env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください。')
      }
      await upsertRouteRecord(route)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存に失敗しました'
      throw err
    } finally {
      saving.value = false
    }
  }

  return {
    saving,
    error,
    saveRoute
  }
}
