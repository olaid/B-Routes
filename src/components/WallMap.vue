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
  onWallClick?: (wall: Wall) => void
}

const props = withDefaults(defineProps<Props>(), {
  areaPolygon: undefined,
  onWallClick: undefined
})

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
const markers: L.Marker[] = []

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
    const marker = L.marker(wall.coordinates).addTo(map!)

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

  map = L.map(mapContainer.value).setView([36.13, 140.0], 13)

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
  () => ({ walls: props.walls, areaPolygon: props.areaPolygon }),
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
