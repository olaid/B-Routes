import type { AreasData, Area, Wall, Route } from '../types'
import { getSupabase, getSupabaseOrThrow, isSupabaseConfigured } from './supabase'

interface DbRouteRow {
  id: string
  wall_id: string
  name: string
  difficulty: string | null
  grade: string | null
  image_url: string
  vectors: Route['vectors']
  description: string | null
  comment: string | null
  sort_order: number | null
}

interface DbWallRow {
  id: string
  area_id: string
  name: string
  lat: number
  lng: number
  image_url: string | null
  image_width: number | null
  image_height: number | null
  notes: string | null
  routes: DbRouteRow[] | null
}

interface DbAreaRow {
  id: string
  name: string
  polygon: [number, number][]
  description: string | null
  is_public: boolean | null
  walls: DbWallRow[] | null
}

function mapRoute(row: DbRouteRow): Route {
  return {
    id: row.id,
    name: row.name,
    difficulty: row.difficulty ?? undefined,
    grade: row.grade ?? undefined,
    imageUrl: row.image_url,
    vectors: row.vectors ?? { lines: [], startHolds: [], keyPoints: [] },
    description: row.description ?? undefined,
    comment: row.comment ?? undefined
  }
}

function mapWall(row: DbWallRow): Wall {
  const routes = (row.routes ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map(mapRoute)
  return {
    id: row.id,
    name: row.name,
    coordinates: [row.lat, row.lng],
    imageUrl: row.image_url ?? undefined,
    imageWidth: row.image_width ?? undefined,
    imageHeight: row.image_height ?? undefined,
    notes: row.notes ?? undefined,
    routes
  }
}

function mapArea(row: DbAreaRow): Area {
  const polygon = Array.isArray(row.polygon) ? row.polygon : []
  const walls = (row.walls ?? []).map(mapWall)
  return {
    id: row.id,
    name: row.name,
    polygon,
    description: row.description ?? undefined,
    isPublic: row.is_public ?? undefined,
    walls
  }
}

async function loadFromJson(): Promise<AreasData> {
  const response = await fetch('/data/areas.json')
  if (!response.ok) throw new Error('ローカル areas.json の読み込みに失敗しました')
  return (await response.json()) as AreasData
}

async function loadFromSupabase(): Promise<AreasData> {
  const supabase = getSupabaseOrThrow()
  const { data, error } = await supabase
    .from('areas')
    .select(
      `
      id,
      name,
      description,
      is_public,
      polygon,
      walls (
        id,
        area_id,
        name,
        lat,
        lng,
        image_url,
        image_width,
        image_height,
        notes,
        routes (
          id,
          wall_id,
          name,
          difficulty,
          grade,
          image_url,
          vectors,
          description,
          comment,
          sort_order
        )
      )
    `
    )
    .order('id')

  if (error) throw new Error(error.message)

  const areas = (data as unknown as DbAreaRow[] | null)?.map(mapArea) ?? []
  return { areas }
}

export async function fetchAreasData(): Promise<AreasData> {
  if (isSupabaseConfigured() && getSupabase()) {
    return loadFromSupabase()
  }
  return loadFromJson()
}

export async function upsertWallRecord(params: {
  id: string
  areaId: string
  name: string
  coordinates: [number, number]
}): Promise<void> {
  const supabase = getSupabaseOrThrow()
  const { error } = await supabase.from('walls').upsert(
    {
      id: params.id,
      area_id: params.areaId,
      name: params.name,
      lat: params.coordinates[0],
      lng: params.coordinates[1]
    },
    { onConflict: 'id' }
  )
  if (error) throw new Error(error.message)
}

export async function deleteRouteRecord(routeId: string): Promise<void> {
  const supabase = getSupabaseOrThrow()
  const { error } = await supabase.from('routes').delete().eq('id', routeId)
  if (error) throw new Error(error.message)
}

export async function upsertRouteRecord(route: Route & { wallId: string }): Promise<void> {
  const supabase = getSupabaseOrThrow()
  const row = {
    id: route.id,
    wall_id: route.wallId,
    name: route.name,
    difficulty: route.difficulty ?? null,
    grade: route.grade ?? route.difficulty ?? null,
    image_url: route.imageUrl,
    vectors: route.vectors,
    description: route.description ?? null,
    comment: route.comment ?? route.description ?? null,
    sort_order: 0
  }
  const { error } = await supabase.from('routes').upsert(row, { onConflict: 'id' })
  if (error) throw new Error(error.message)
}

const ROUTE_IMAGES_BUCKET = 'route-images'

export async function uploadRouteImage(file: File, wallId?: string): Promise<string> {
  const supabase = getSupabaseOrThrow()
  const safeName = file.name.replace(/[^\w.-]/g, '_')
  const prefix =
    wallId && wallId !== 'new' ? wallId : 'misc'
  const path = `${prefix}/${crypto.randomUUID()}_${safeName}`

  const { error } = await supabase.storage.from(ROUTE_IMAGES_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined
  })

  if (error) {
    throw new Error(
      `画像のアップロードに失敗しました（バケット「${ROUTE_IMAGES_BUCKET}」を作成・ポリシー設定済みか確認してください）: ${error.message}`
    )
  }

  const { data } = supabase.storage.from(ROUTE_IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
