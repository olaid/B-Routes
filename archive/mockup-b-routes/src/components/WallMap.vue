<template>
  <div ref="mapContainer" class="wall-map"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import type { Wall } from '../types'
import { MAP_AREA_DETAIL_FIT_PADDING } from '../lib/mapFit'

interface Props {
  walls: Wall[]
  /** 壁が0件のときのみ fitBounds に使う（現状 UI では未使用） */
  areaPolygon?: [number, number][]
  selectedWallId?: string
  onWallClick?: (wall: Wall) => void
}

const props = withDefaults(defineProps<Props>(), {
  areaPolygon: undefined,
  selectedWallId: undefined,
  onWallClick: undefined
})

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
const markers: L.Marker[] = []

const selectedWallIcon = L.divIcon({
  className: 'selected-wall-marker',
  html: '<span></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14]
})

/** 壁がエリア内に収まっていると「ポリゴン＋壁」の bounds がトップのエリア矩形と一致し倍率が変わらないため、壁があるときは壁だけを基準に fit する */
function applyBounds() {
  if (!map) return

  let bounds: L.LatLngBounds | null = null

  if (props.walls.length > 0) {
    bounds = L.latLngBounds(props.walls.map(w => w.coordinates))
    if (bounds.getSouthWest().equals(bounds.getNorthEast())) {
      bounds = bounds.pad(0.004)
    }
  } else if (props.areaPolygon && props.areaPolygon.length >= 3) {
    bounds = L.latLngBounds(props.areaPolygon as L.LatLngExpression[])
  }

  if (bounds?.isValid()) {
    map.fitBounds(bounds, {
      padding: MAP_AREA_DETAIL_FIT_PADDING,
      maxZoom: 19
    })
  }
}

const updateWalls = () => {
  if (!map) return

  markers.forEach(m => m.remove())
  markers.length = 0

  props.walls.forEach(wall => {
    const marker = L.marker(wall.coordinates, {
      icon: wall.id === props.selectedWallId ? selectedWallIcon : undefined
    }).addTo(map!)

    marker.bindPopup(wall.name)

    marker.on('click', () => {
      if (props.onWallClick) {
        props.onWallClick(wall)
      }
    })

    markers.push(marker)
  })

  applyBounds()
}

onMounted(async () => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([36.3945, 140.1685], 16)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  await nextTick()
  updateWalls()
  requestAnimationFrame(() => {
    map?.invalidateSize({ animate: false })
    applyBounds()
  })
})

watch(
  () => ({ walls: props.walls, areaPolygon: props.areaPolygon, selectedWallId: props.selectedWallId }),
  () => updateWalls(),
  { deep: true }
)
</script>

<style scoped>
.wall-map {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

:deep(.selected-wall-marker span) {
  display: block;
  width: 28px;
  height: 28px;
  border: 4px solid #fff;
  border-radius: 999px;
  background: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.35), 0 4px 14px rgba(15, 23, 42, 0.35);
}

@media (max-width: 768px) {
  .wall-map {
    min-height: 300px;
  }
}

@media (max-width: 480px) {
  .wall-map {
    min-height: 250px;
  }
}
</style>
