#!/usr/bin/env node
// 旧モックアップ `archive/mockup-b-routes/public/data/areas.json` を
// 新スキーマ（apps/web/src/types/domain.ts）に変換し、
// `supabase/seed/areas.seed.json` と `apps/web/public/data/areas.seed.json` に出力する。

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')

const SRC = resolve(repoRoot, 'archive/mockup-b-routes/public/data/areas.json')
const DEST_SUPABASE = resolve(repoRoot, 'supabase/seed/areas.seed.json')
const DEST_WEB = resolve(repoRoot, 'apps/web/public/data/areas.seed.json')

function toSlug(id) {
  return String(id)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function mapWall(rawWall, areaId) {
  if (!Array.isArray(rawWall.coordinates) || rawWall.coordinates.length !== 2) {
    throw new Error(`wall ${rawWall.id} has invalid coordinates`)
  }
  const [lat, lng] = rawWall.coordinates
  return {
    id: String(rawWall.id),
    areaId,
    name: String(rawWall.name ?? rawWall.id),
    coordinates: [lat, lng],
    imageUrl: rawWall.imageUrl ?? undefined,
    imageWidth: rawWall.imageWidth ?? undefined,
    imageHeight: rawWall.imageHeight ?? undefined,
    accessNotes: rawWall.accessNotes ?? undefined,
    safetyNotes: rawWall.safetyNotes ?? undefined,
    hazardNotes: rawWall.hazardNotes ?? undefined,
    visibility: rawWall.visibility ?? 'public',
    status: rawWall.status ?? 'published',
    routes: Array.isArray(rawWall.routes)
      ? rawWall.routes.map((r) => mapRoute(r, String(rawWall.id)))
      : []
  }
}

function mapRoute(rawRoute, wallId) {
  return {
    id: String(rawRoute.id),
    wallId,
    name: String(rawRoute.name ?? rawRoute.id),
    gradeJp: rawRoute.gradeJp ?? undefined,
    gradeV: rawRoute.gradeV ?? rawRoute.difficulty ?? undefined,
    comment: rawRoute.comment ?? rawRoute.description ?? undefined,
    moveMemo: rawRoute.moveMemo ?? undefined,
    starts: rawRoute.starts ?? undefined,
    finish: rawRoute.finish ?? undefined,
    eliminations: rawRoute.eliminations ?? undefined,
    svgPath: rawRoute.svgPath ?? undefined,
    status: rawRoute.status ?? 'published'
  }
}

function mapArea(rawArea) {
  if (!Array.isArray(rawArea.polygon) || rawArea.polygon.length < 3) {
    throw new Error(`area ${rawArea.id} has invalid polygon`)
  }
  const id = String(rawArea.id)
  const slug = rawArea.slug ?? toSlug(id)
  return {
    id,
    slug,
    name: String(rawArea.name ?? id),
    polygon: rawArea.polygon.map(([lat, lng]) => [lat, lng]),
    description: rawArea.description ?? undefined,
    accessNotes: rawArea.accessNotes ?? undefined,
    visibility: rawArea.visibility ?? 'public',
    status: rawArea.status ?? 'published',
    walls: Array.isArray(rawArea.walls) ? rawArea.walls.map((w) => mapWall(w, id)) : []
  }
}

async function main() {
  const raw = JSON.parse(await readFile(SRC, 'utf8'))
  if (!Array.isArray(raw.areas)) {
    throw new Error('source areas.json must have an `areas` array')
  }

  const areas = raw.areas.map(mapArea)
  const out = { areas }
  const json = JSON.stringify(out, null, 2) + '\n'

  await mkdir(dirname(DEST_SUPABASE), { recursive: true })
  await writeFile(DEST_SUPABASE, json, 'utf8')
  await mkdir(dirname(DEST_WEB), { recursive: true })
  await writeFile(DEST_WEB, json, 'utf8')

  const wallCount = areas.reduce((sum, a) => sum + a.walls.length, 0)
  const routeCount = areas.reduce(
    (sum, a) => sum + a.walls.reduce((s, w) => s + w.routes.length, 0),
    0
  )
  console.log(
    `migrated: ${areas.length} areas, ${wallCount} walls, ${routeCount} routes`
  )
  console.log(`-> ${DEST_SUPABASE}`)
  console.log(`-> ${DEST_WEB}`)
}

main().catch((err) => {
  console.error('migration failed:', err)
  process.exitCode = 1
})
