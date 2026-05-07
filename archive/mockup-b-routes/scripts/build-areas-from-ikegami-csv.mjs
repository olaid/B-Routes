/**
 * scripts/ikegami-csv-points.json（CSV 由来の [エリア名, 岩名, 緯度, 経度]）から public/data/areas.json を生成する。
 * CSV を更新したら points JSON を直してから: npm run build:areas
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const pointsPath = path.join(root, 'scripts/ikegami-csv-points.json')

/** エリア名 → ルート用の安定 id */
const AREA_SLUG = {
  崩落地周辺（仮）: 'ik-bakudai',
  ハイキング道周辺: 'ik-hike',
  ハイキング道周辺上: 'ik-hike-up',
  東尾根（仮）: 'ik-higashi-one',
  東エリア（仮）: 'ik-higashi',
  森エリア（仮）: 'ik-mori',
  谷広場上（仮）: 'ik-tani-ue',
  西エリア（仮）: 'ik-nishi',
  谷広場（仮）: 'ik-tani',
  北西エリア（仮）: 'ik-hokusei',
  その他: 'ik-misc',
  西急登（仮）: 'ik-nishi-kyu',
  石垣エリア: 'ik-ishigaki',
}

/** @param {{ lat: number, lon: number }[]} points */
function boundsPolygon(
  points,
  padRatio = 0.14,
  minPadLat = 0.00035,
  minPadLng = 0.00045
) {
  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity
  for (const { lat, lon } of points) {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lon)
    maxLng = Math.max(maxLng, lon)
  }
  const spanLat = Math.max(maxLat - minLat, 1e-9)
  const spanLng = Math.max(maxLng - minLng, 1e-9)
  const padLat = Math.max(spanLat * padRatio, minPadLat)
  const padLng = Math.max(spanLng * padRatio, minPadLng)
  const south = minLat - padLat
  const north = maxLat + padLat
  const west = minLng - padLng
  const east = maxLng + padLng
  return [
    [south, west],
    [south, east],
    [north, east],
    [north, west],
  ]
}

/** @type {[string, string, number, number][]} */
const rawPoints = JSON.parse(fs.readFileSync(pointsPath, 'utf8'))
const rows = rawPoints.map(([area, name, lat, lon], i) => ({
  line: i + 2,
  area,
  name,
  lat,
  lon,
}))

const byArea = new Map()
const areaOrder = []
for (const r of rows) {
  if (!byArea.has(r.area)) {
    byArea.set(r.area, [])
    areaOrder.push(r.area)
  }
  byArea.get(r.area).push(r)
}

const areas = areaOrder.map((areaName) => {
  const pts = byArea.get(areaName)
  const slug = AREA_SLUG[areaName]
  if (!slug) {
    throw new Error(`未登録のエリア名です（AREA_SLUG に追加）: ${areaName}`)
  }
  const polygon = boundsPolygon(pts)
  const walls = pts.map((p, j) => ({
    id: `${slug}-w${String(j + 1).padStart(3, '0')}`,
    name: p.name,
    coordinates: [p.lat, p.lon],
    routes: [],
  }))
  return {
    id: slug,
    name: areaName,
    polygon,
    walls,
  }
})

const outPath = path.join(root, 'public/data/areas.json')
fs.writeFileSync(outPath, JSON.stringify({ areas }, null, 2), 'utf8')

console.log('rows', rows.length, 'areas', areas.length, '->', outPath)
