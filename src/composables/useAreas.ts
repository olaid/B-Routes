import { ref, onMounted } from 'vue'
import type { AreasData, Area, Wall, Route } from '../types'

const areasData = ref<AreasData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useAreas() {
  const loadAreas = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('/data/areas.json')
      if (!response.ok) {
        throw new Error('データの読み込みに失敗しました')
      }
      areasData.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '不明なエラーが発生しました'
      console.error('Areas data loading error:', err)
    } finally {
      loading.value = false
    }
  }

  const getArea = (areaId: string): Area | undefined => {
    return areasData.value?.areas.find(area => area.id === areaId)
  }

  const getWall = (areaId: string, wallId: string): Wall | undefined => {
    const area = getArea(areaId)
    return area?.walls.find(wall => wall.id === wallId)
  }

  const getRoute = (areaId: string, wallId: string, routeId: string): Route | undefined => {
    const wall = getWall(areaId, wallId)
    return wall?.routes.find(route => route.id === routeId)
  }

  onMounted(() => {
    if (!areasData.value) {
      loadAreas()
    }
  })

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

