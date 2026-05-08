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

/** Leaflet は [lat, lng] */
export function toLeafletLatLng(p: LatLng): L.LatLngExpression {
  return [p[0], p[1]]
}
