import type { Area, AreasData, Wall } from '../types/domain'
import { filterAreasData } from './publishedFilters'

let cache: AreasData | null = null
let inflight: Promise<AreasData> | null = null

export async function loadAreasData(url = '/data/areas.seed.json'): Promise<AreasData> {
  if (cache) return cache
  if (!inflight) {
    inflight = (async () => {
      try {
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`エリアデータを読み込めませんでした (${res.status})`)
        }
        const raw = (await res.json()) as AreasData
        const areas = filterAreasData(raw.areas)
        const data: AreasData = { areas }
        cache = data
        return data
      } finally {
        inflight = null
      }
    })()
  }
  return inflight
}

export function getAreaBySlug(areas: Area[], slug: string): Area | undefined {
  return areas.find((a) => a.slug === slug)
}

export function findWallWithArea(
  areas: Area[],
  wallId: string
): { area: Area; wall: Wall } | undefined {
  for (const area of areas) {
    const wall = area.walls.find((w) => w.id === wallId)
    if (wall) return { area, wall }
  }
  return undefined
}
