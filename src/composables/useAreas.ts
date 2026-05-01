import { ref } from 'vue'
import type { AreasData, Area, Wall, Route } from '../types'
import { fetchAreasData } from '../lib/areasRepository'

const areasData = ref<AreasData | null>(null)
/** 初回はデータ未取得のため true（各ビューで loadAreas を呼ぶ前提） */
const loading = ref(true)
const error = ref<string | null>(null)

export function useAreas() {
  const loadAreas = async () => {
    loading.value = true
    error.value = null
    try {
      areasData.value = await fetchAreasData()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '不明なエラーが発生しました'
      console.error('Areas data loading error:', err)
    } finally {
      loading.value = false
    }
  }

  const getArea = (areaId: string): Area | undefined => {
    return areasData.value?.areas.find((area) => area.id === areaId)
  }

  const getWall = (areaId: string, wallId: string): Wall | undefined => {
    const area = getArea(areaId)
    return area?.walls.find((wall) => wall.id === wallId)
  }

  const getRoute = (areaId: string, wallId: string, routeId: string): Route | undefined => {
    const wall = getWall(areaId, wallId)
    return wall?.routes.find((r) => r.id === routeId)
  }

  return {
    areasData,
    loading,
    error,
    loadAreas,
    getArea,
    getWall,
    getRoute
  }
}
