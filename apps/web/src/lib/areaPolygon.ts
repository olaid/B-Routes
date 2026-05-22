import type { LatLng, Polygon } from '../types/domain'

const EARTH_R = 6_378_137

function median(xs: number[]): number {
  if (xs.length === 0) return Number.NaN
  const s = [...xs].sort((a, b) => a - b)
  const n = s.length
  return n % 2 === 1 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

/** 平面近似での距離（小エリア用、メートル） */
function planarDistanceMeters(a: LatLng, b: LatLng): number {
  const dLatRad = ((a[0] - b[0]) * Math.PI) / 180
  const dLngRad = ((a[1] - b[1]) * Math.PI) / 180
  const meanLatRad = (((a[0] + b[0]) / 2) * Math.PI) / 180
  const dy = dLatRad
  const dx = dLngRad * Math.cos(meanLatRad)
  return Math.hypot(dy, dx) * EARTH_R
}

/** Andrew's monotone chain による凸包。`points` は [x, y]、戻り値は CCW。 */
function convexHull2D(points: ReadonlyArray<readonly [number, number]>): Array<[number, number]> {
  if (points.length <= 1) return points.map(([x, y]) => [x, y])
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (
    o: readonly [number, number],
    a: readonly [number, number],
    b: readonly [number, number]
  ) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

  const lower: Array<[number, number]> = []
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop()
    }
    lower.push([p[0], p[1]])
  }
  const upper: Array<[number, number]> = []
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const p = sorted[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop()
    }
    upper.push([p[0], p[1]])
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)]
}

/** 緯度経度配列の凸包（CCW、[lat,lng] のまま） */
export function convexHullLatLng(points: LatLng[]): LatLng[] {
  const xy: Array<[number, number]> = points.map(([lat, lng]) => [lng, lat])
  const hull = convexHull2D(xy)
  return hull.map(([x, y]) => [y, x] as LatLng)
}

/** 重心から放射方向に `padMeters` だけ拡張する */
export function expandPolygonOutward(polygon: Polygon, padMeters: number): Polygon {
  if (polygon.length === 0 || padMeters <= 0) return polygon.map((p) => [p[0], p[1]] as LatLng)
  let cLat = 0
  let cLng = 0
  for (const [lat, lng] of polygon) {
    cLat += lat
    cLng += lng
  }
  cLat /= polygon.length
  cLng /= polygon.length
  const cosLat = Math.cos((cLat * Math.PI) / 180)

  return polygon.map(([lat, lng]) => {
    const dyM = ((lat - cLat) * Math.PI) / 180 * EARTH_R
    const dxM = ((lng - cLng) * Math.PI) / 180 * EARTH_R * cosLat
    const dist = Math.hypot(dyM, dxM)
    if (dist === 0) return [lat, lng] as LatLng
    const factor = (dist + padMeters) / dist
    const newDyM = dyM * factor
    const newDxM = dxM * factor
    const newLat = cLat + (newDyM / EARTH_R) * (180 / Math.PI)
    const newLng = cLng + (newDxM / (EARTH_R * cosLat)) * (180 / Math.PI)
    return [newLat, newLng] as LatLng
  })
}

export interface BuildPolygonOptions {
  /** これを超える中央値からの距離（m）の点は外れ値として除外する */
  outlierMeters?: number
  /** 凸包の外向き拡張量（m） */
  padMeters?: number
  /** 全点が外れ値で除外されてしまった場合に外れ値除外をスキップするか */
  fallbackIfAllFiltered?: boolean
}

export interface BuildPolygonResult {
  polygon: Polygon
  inlierCount: number
  outliers: LatLng[]
}

/**
 * 岩座標群からエリアポリゴン（凸包＋拡張）を生成する。
 * 中央値中心から `outlierMeters` を超える点はポリゴンから除外（点自体は呼び元で保持される）。
 */
export function buildAreaPolygon(
  walls: ReadonlyArray<LatLng>,
  options: BuildPolygonOptions = {}
): BuildPolygonResult {
  const { outlierMeters = 500, padMeters = 25, fallbackIfAllFiltered = true } = options

  if (walls.length === 0) {
    return { polygon: [], inlierCount: 0, outliers: [] }
  }
  if (walls.length === 1) {
    const [lat, lng] = walls[0]
    const ring = makeCircleRing([lat, lng], Math.max(padMeters, 25), 12)
    return { polygon: ring, inlierCount: 1, outliers: [] }
  }

  const medLat = median(walls.map(([lat]) => lat))
  const medLng = median(walls.map(([, lng]) => lng))
  const center: LatLng = [medLat, medLng]

  const labels = walls.map((w) => ({
    point: w,
    distance: planarDistanceMeters(w, center),
    isOutlier: false
  }))
  for (const item of labels) {
    item.isOutlier = item.distance > outlierMeters
  }

  let inliers = labels.filter((l) => !l.isOutlier).map((l) => l.point)
  let outliers = labels.filter((l) => l.isOutlier).map((l) => l.point)

  if (inliers.length === 0 && fallbackIfAllFiltered) {
    inliers = walls.map((w) => [w[0], w[1]] as LatLng)
    outliers = []
  }

  const polygon = polygonFromPoints(inliers, padMeters)
  return { polygon, inlierCount: inliers.length, outliers }
}

function polygonFromPoints(points: LatLng[], padMeters: number): Polygon {
  if (points.length === 0) return []
  if (points.length === 1) {
    return makeCircleRing(points[0], Math.max(padMeters, 25), 12)
  }
  if (points.length === 2) {
    const [a, b] = points
    const midLat = (a[0] + b[0]) / 2
    const cosLat = Math.cos((midLat * Math.PI) / 180)
    const dyM = ((b[0] - a[0]) * Math.PI) / 180 * EARTH_R
    const dxM = ((b[1] - a[1]) * Math.PI) / 180 * EARTH_R * cosLat
    const len = Math.hypot(dyM, dxM) || 1
    const halfThickM = Math.max(padMeters, 12)
    const perpDyM = (-dxM / len) * halfThickM
    const perpDxM = (dyM / len) * halfThickM
    const dLat = (perpDyM / EARTH_R) * (180 / Math.PI)
    const dLng = (perpDxM / (EARTH_R * cosLat)) * (180 / Math.PI)
    const ring: Polygon = [
      [a[0] + dLat, a[1] + dLng],
      [b[0] + dLat, b[1] + dLng],
      [b[0] - dLat, b[1] - dLng],
      [a[0] - dLat, a[1] - dLng]
    ]
    return expandPolygonOutward(ring, padMeters)
  }
  const hull = convexHullLatLng(points)
  if (hull.length < 3) {
    return polygonFromPoints(points.slice(0, 2), padMeters)
  }
  return expandPolygonOutward(hull, padMeters)
}

function makeCircleRing(center: LatLng, radiusMeters: number, sides: number): Polygon {
  const [lat, lng] = center
  const cosLat = Math.cos((lat * Math.PI) / 180)
  const ring: Polygon = []
  for (let i = 0; i < sides; i += 1) {
    const θ = (i / sides) * 2 * Math.PI
    const dyM = Math.sin(θ) * radiusMeters
    const dxM = Math.cos(θ) * radiusMeters
    ring.push([
      lat + (dyM / EARTH_R) * (180 / Math.PI),
      lng + (dxM / (EARTH_R * cosLat)) * (180 / Math.PI)
    ])
  }
  return ring
}
