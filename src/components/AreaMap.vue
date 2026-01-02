<template>
  <div ref="mapContainer" class="area-map"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import type { Area } from '../types'

interface Props {
  areas: Area[]
  onAreaClick?: (area: Area) => void
}

const props = withDefaults(defineProps<Props>(), {
  onAreaClick: undefined
})

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
const polygons: L.Polygon[] = []

onMounted(() => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([35.05, 139.05], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  updateAreas()
})

watch(() => props.areas, () => {
  updateAreas()
}, { deep: true })

const updateAreas = () => {
  if (!map) return

  // 既存のポリゴンを削除
  polygons.forEach(polygon => polygon.remove())
  polygons.length = 0

  // エリアを描画
  props.areas.forEach(area => {
    if (area.polygon.length < 3) return

    const polygon = L.polygon(area.polygon as L.LatLngExpression[], {
      color: '#3388ff',
      fillColor: '#3388ff',
      fillOpacity: 0.3,
      weight: 2
    }).addTo(map!)

    polygon.on('click', () => {
      if (props.onAreaClick) {
        props.onAreaClick(area)
      }
    })

    polygons.push(polygon)
  })

  // すべてのエリアが表示されるようにズーム調整
  if (props.areas.length > 0) {
    const bounds = L.latLngBounds(
      props.areas.flatMap(area => area.polygon)
    )
    map.fitBounds(bounds, { padding: [20, 20] })
  }
}
</script>

<style scoped>
.area-map {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

@media (max-width: 768px) {
  .area-map {
    min-height: 300px;
  }
}

@media (max-width: 480px) {
  .area-map {
    min-height: 250px;
  }
}
</style>

