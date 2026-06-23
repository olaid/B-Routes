import type { Area } from '../types/domain'

export interface AreaMapColor {
  color: string
  fillColor: string
  fillOpacity: number
}

/** エリアポリゴン用の4色（枠線・塗り） */
export const AREA_MAP_PALETTE: readonly AreaMapColor[] = [
  { color: '#0f766e', fillColor: '#14b8a6', fillOpacity: 0.28 },
  { color: '#1d4ed8', fillColor: '#60a5fa', fillOpacity: 0.28 },
  { color: '#b45309', fillColor: '#fbbf24', fillOpacity: 0.28 },
  { color: '#be123c', fillColor: '#fb7185', fillOpacity: 0.28 }
] as const

const PALETTE_SIZE = AREA_MAP_PALETTE.length

/** 全エリアで同じ id なら同じ色になるよう、id 昇順の並びで 0–3 を割り当て */
export function areaColorIndex(areaId: string, areaIds: readonly string[]): number {
  const sorted = [...areaIds].sort()
  const idx = sorted.indexOf(areaId)
  if (idx < 0) return 0
  return idx % PALETTE_SIZE
}

export function getAreaMapColor(areaId: string, areas: readonly Area[]): AreaMapColor {
  const ids = areas.map((a) => a.id)
  return AREA_MAP_PALETTE[areaColorIndex(areaId, ids)]
}

export function areaPolygonPathOptions(
  areaId: string,
  areas: readonly Area[],
  overrides?: { fillOpacity?: number }
) {
  const { color, fillColor, fillOpacity } = getAreaMapColor(areaId, areas)
  return {
    color,
    weight: 2,
    fillColor,
    fillOpacity: overrides?.fillOpacity ?? fillOpacity
  }
}
