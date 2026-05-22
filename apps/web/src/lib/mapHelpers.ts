import L from 'leaflet'
import type { Area, LatLng, Polygon } from '../types/domain'

export function boundsFromPolygon(poly: Polygon): L.LatLngBounds {
  return L.latLngBounds(poly.map(([lat, lng]) => L.latLng(lat, lng)))
}

export function boundsFromAreas(areas: Area[]): L.LatLngBounds | null {
  if (areas.length === 0) return null
  let b = boundsFromPolygon(areas[0].polygon)
  for (let i = 1; i < areas.length; i += 1) {
    b = b.extend(boundsFromPolygon(areas[i].polygon))
  }
  return b
}

/**
 * ポリゴン ∪ 全岩座標で bounds を取る。
 * ポリゴンが外れ値を除外して縮んだ場合でも、外れ岩マーカーが画面内に収まるようにする。
 */
export function boundsFromArea(area: Area): L.LatLngBounds {
  let b = boundsFromPolygon(area.polygon)
  for (const w of area.walls) {
    b = b.extend(L.latLng(w.coordinates[0], w.coordinates[1]))
  }
  return b
}

/** Leaflet は [lat, lng] */
export function toLeafletLatLng(p: LatLng): L.LatLngExpression {
  return [p[0], p[1]]
}
