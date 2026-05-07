import type { Area, Route, Wall } from '../types/domain'

export function filterPublishedRoute(r: Route): boolean {
  return r.status === 'published'
}

export function filterPublishedWall(w: Wall): Wall | null {
  if (w.status !== 'published' || w.visibility !== 'public') return null
  return {
    ...w,
    routes: w.routes.filter(filterPublishedRoute)
  }
}

export function filterPublishedArea(a: Area): Area | null {
  if (a.status !== 'published' || a.visibility !== 'public') return null
  const walls = a.walls.map(filterPublishedWall).filter(Boolean) as Wall[]
  return { ...a, walls }
}

export function filterAreasData(areas: Area[]): Area[] {
  return areas.map(filterPublishedArea).filter(Boolean) as Area[]
}
