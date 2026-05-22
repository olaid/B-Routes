// 注: apps/web/src/lib/areaPolygon.ts と同等のロジック（CommonJS互換ESM、純Node）。
// 変更時は両方を同期させること。テストは vitest 側で担保。

const EARTH_R = 6_378_137

function median(xs) {
  if (xs.length === 0) return Number.NaN
  const s = [...xs].sort((a, b) => a - b)
  const n = s.length
  return n % 2 === 1 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

function planarDistanceMeters(a, b) {
  const dLatRad = ((a[0] - b[0]) * Math.PI) / 180
  const dLngRad = ((a[1] - b[1]) * Math.PI) / 180
  const meanLatRad = (((a[0] + b[0]) / 2) * Math.PI) / 180
  const dy = dLatRad
  const dx = dLngRad * Math.cos(meanLatRad)
  return Math.hypot(dy, dx) * EARTH_R
}

function convexHull2D(points) {
  if (points.length <= 1) return points.map(([x, y]) => [x, y])
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower = []
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop()
    }
    lower.push([p[0], p[1]])
  }
  const upper = []
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const p = sorted[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop()
    }
    upper.push([p[0], p[1]])
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)]
}

export function convexHullLatLng(points) {
  const xy = points.map(([lat, lng]) => [lng, lat])
  const hull = convexHull2D(xy)
  return hull.map(([x, y]) => [y, x])
}

export function expandPolygonOutward(polygon, padMeters) {
  if (polygon.length === 0 || padMeters <= 0) return polygon.map((p) => [p[0], p[1]])
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
    if (dist === 0) return [lat, lng]
    const factor = (dist + padMeters) / dist
    const newDyM = dyM * factor
    const newDxM = dxM * factor
    const newLat = cLat + (newDyM / EARTH_R) * (180 / Math.PI)
    const newLng = cLng + (newDxM / (EARTH_R * cosLat)) * (180 / Math.PI)
    return [newLat, newLng]
  })
}

function makeCircleRing(center, radiusMeters, sides) {
  const [lat, lng] = center
  const cosLat = Math.cos((lat * Math.PI) / 180)
  const ring = []
  for (let i = 0; i < sides; i += 1) {
    const t = (i / sides) * 2 * Math.PI
    const dyM = Math.sin(t) * radiusMeters
    const dxM = Math.cos(t) * radiusMeters
    ring.push([
      lat + (dyM / EARTH_R) * (180 / Math.PI),
      lng + (dxM / (EARTH_R * cosLat)) * (180 / Math.PI)
    ])
  }
  return ring
}

function polygonFromPoints(points, padMeters) {
  if (points.length === 0) return []
  if (points.length === 1) return makeCircleRing(points[0], Math.max(padMeters, 25), 12)
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
    const ring = [
      [a[0] + dLat, a[1] + dLng],
      [b[0] + dLat, b[1] + dLng],
      [b[0] - dLat, b[1] - dLng],
      [a[0] - dLat, a[1] - dLng]
    ]
    return expandPolygonOutward(ring, padMeters)
  }
  const hull = convexHullLatLng(points)
  if (hull.length < 3) return polygonFromPoints(points.slice(0, 2), padMeters)
  return expandPolygonOutward(hull, padMeters)
}

export function buildAreaPolygon(walls, options = {}) {
  const { outlierMeters = 500, padMeters = 25, fallbackIfAllFiltered = true } = options
  if (walls.length === 0) return { polygon: [], inlierCount: 0, outliers: [] }
  if (walls.length === 1) {
    return { polygon: makeCircleRing(walls[0], Math.max(padMeters, 25), 12), inlierCount: 1, outliers: [] }
  }
  const medLat = median(walls.map(([lat]) => lat))
  const medLng = median(walls.map(([, lng]) => lng))
  const center = [medLat, medLng]
  const labels = walls.map((w) => {
    const distance = planarDistanceMeters(w, center)
    return { point: w, distance, isOutlier: distance > outlierMeters }
  })
  let inliers = labels.filter((l) => !l.isOutlier).map((l) => l.point)
  let outliers = labels.filter((l) => l.isOutlier).map((l) => l.point)
  if (inliers.length === 0 && fallbackIfAllFiltered) {
    inliers = walls.map((w) => [w[0], w[1]])
    outliers = []
  }
  const polygon = polygonFromPoints(inliers, padMeters)
  return { polygon, inlierCount: inliers.length, outliers }
}
