import { ref } from 'vue'
import type { Wall } from '../types'

export function useWallEditor() {
  const saving = ref(false)
  const error = ref<string | null>(null)

  const saveWall = async (wall: Wall) => {
    saving.value = true
    error.value = null
    try {
      // TODO: 実際の保存処理を実装（JSONファイルへの書き込みまたはAPI呼び出し）
      console.log('Saving wall:', wall)
      // 現在はJSONファイルの直接編集が必要
      alert('保存機能は実装中です。JSONファイルを直接編集してください。')
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

