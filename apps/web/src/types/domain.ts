export type Visibility = 'public' | 'private'
export type PublishStatus = 'draft' | 'published'
export type LatLng = readonly [number, number]
export type Polygon = LatLng[]

export interface Area {
  id: string
  slug: string
  name: string
  polygon: Polygon
  description?: string
  accessNotes?: string
  visibility: Visibility
  status: PublishStatus
  walls: Wall[]
}

export interface Wall {
  id: string
  areaId: string
  name: string
  coordinates: LatLng
  /** 元データの座標がエリア中心から大きく外れた値の場合に true。エリア地図でマーカー表示しない */
  outOfBounds?: boolean
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  accessNotes?: string
  safetyNotes?: string
  hazardNotes?: string
  visibility: Visibility
  status: PublishStatus
  routes: Route[]
}

export interface Route {
  id: string
  wallId: string
  name: string
  gradeJp?: string
  gradeV?: string
  comment?: string
  moveMemo?: string
  starts?: string
  finish?: string
  eliminations?: string
  svgPath?: string
  status: PublishStatus
}

export interface AreasData {
  areas: Area[]
}
