import { ref } from 'vue'
import { upsertWallRecord } from '../lib/areasRepository'
import { isSupabaseConfigured } from '../lib/supabase'

export function useWallEditor() {
  const saving = ref(false)
  const error = ref<string | null>(null)

  const saveWall = async (params: {
    id: string
    areaId: string
    name: string
    coordinates: [number, number]
  }) => {
    saving.value = true
    error.value = null
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase が未設定です。.env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください。')
      }
      await upsertWallRecord(params)
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
    saveWall
  }
}
