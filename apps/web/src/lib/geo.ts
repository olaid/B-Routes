import type { LatLng, Polygon } from '../types/domain'

const EARTH_RADIUS_M = 6_371_008.8

const toRad = (deg: number): number => (deg * Math.PI) / 180
const toDeg = (rad: number): number => (rad * 180) / Math.PI

/** 2点間の地表大円距離（メートル） */
export function haversineDistance(from: LatLng, to: LatLng): number {
  const [lat1, lng1] = from
  const [lat2, lng2] = to
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_M * c
}

/**
 * `from` から `to` への初期方位（北を 0° とした 0..360°）。
 * https://www.movable-type.co.uk/scripts/latlong.html
 */
export function initialBearing(from: LatLng, to: LatLng): number {
  const [lat1, lng1] = from
  const [lat2, lng2] = to
  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δλ = toRad(lng2 - lng1)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  const θ = Math.atan2(y, x)
  return (toDeg(θ) + 360) % 360
}

/**
 * 緯度経度ポリゴンの重心（centroid）。
 * 平面近似で十分な精度（ボルダーエリアサイズ）を前提に、
 * 球面投影せず単純な符号付き面積方式で算出する。
 * 縮退（面積 0 = 直線・1点）の場合は頂点の単純平均にフォールバック。
 */
export function polygonCentroid(polygon: Polygon): LatLng {
  if (polygon.length === 0) {
    throw new Error('polygonCentroid: polygon is empty')
  }
  if (polygon.length === 1) {
    return [polygon[0][0], polygon[0][1]] as LatLng
  }

  let twiceArea = 0
  let cx = 0
  let cy = 0

  for (let i = 0; i < polygon.length; i += 1) {
    const [y0, x0] = polygon[i]
    const next = polygon[(i + 1) % polygon.length]
    const [y1, x1] = next
    const cross = x0 * y1 - x1 * y0
    twiceArea += cross
    cx += (x0 + x1) * cross
    cy += (y0 + y1) * cross
  }

  if (twiceArea === 0) {
    let sumLat = 0
    let sumLng = 0
    for (const [lat, lng] of polygon) {
      sumLat += lat
      sumLng += lng
    }
    return [sumLat / polygon.length, sumLng / polygon.length] as LatLng
  }

  const factor = 3 * twiceArea
  return [cy / factor, cx / factor] as LatLng
}

/** 距離をユーザー向け文字列にフォーマット（< 1km は m、≥ 1km は km） */
export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '—'
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  const km = meters / 1000
  return `${km.toFixed(km >= 10 ? 0 : 1)} km`
}

/** 北を 0° とした方位を 8 方位の日本語ラベルへ */
export function compassLabel(bearingDeg: number): string {
  const labels = ['北', '北東', '東', '南東', '南', '南西', '西', '北西']
  const idx = Math.round(((bearingDeg % 360) + 360) % 360 / 45) % 8
  return labels[idx]
}
