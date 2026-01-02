<template>
  <div ref="mapContainer" class="wall-map"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'
import type { Wall } from '../types'

interface Props {
  walls: Wall[]
  onWallClick?: (wall: Wall) => void
}

const props = withDefaults(defineProps<Props>(), {
  onWallClick: undefined
})

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
const markers: L.Marker[] = []

onMounted(() => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([35.05, 139.05], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  updateWalls()
})

watch(() => props.walls, () => {
  updateWalls()
}, { deep: true })

const updateWalls = () => {
  if (!map) return

  // 既存のマーカーを削除
  markers.forEach(marker => marker.remove())
  markers.length = 0

  // 壁のマーカーを表示
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

  // すべての壁が表示されるようにズーム調整
  if (props.walls.length > 0) {
    const bounds = L.latLngBounds(
      props.walls.map(wall => wall.coordinates)
    )
    map.fitBounds(bounds, { padding: [50, 50] })
  }
}
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

