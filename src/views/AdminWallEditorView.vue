<template>
  <div class="admin-wall-editor-view">
    <header class="header">
      <button @click="goBack" class="back-button">← 戻る</button>
      <h1>{{ isEdit ? '壁を編集' : '壁を追加' }}</h1>
    </header>
    <main class="main-content">
      <div v-if="loading" class="loading">読み込み中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!area" class="error">エリアが見つかりません</div>
      <div v-else class="editor-content">
        <div class="form-section">
          <label>
            壁の名前:
            <input v-model="wallName" type="text" class="input" />
          </label>
        </div>
        <div class="form-section">
          <label>
            地図上で壁の位置をクリックしてください:
          </label>
          <div ref="mapContainer" class="map-container"></div>
          <div v-if="selectedCoordinates" class="coordinates">
            選択された座標: {{ selectedCoordinates[0].toFixed(6) }}, {{ selectedCoordinates[1].toFixed(6) }}
          </div>
        </div>
        <div class="form-section">
          <h3>ルート一覧</h3>
          <div v-if="currentWall && currentWall.routes.length > 0" class="routes-list">
            <div
              v-for="route in currentWall.routes"
              :key="route.id"
              class="route-item"
            >
              <span>{{ route.name }}</span>
              <div class="route-actions">
                <button @click="editRoute(route.id)" class="btn btn-secondary">編集</button>
                <button @click="deleteRoute(route.id)" class="btn btn-danger">削除</button>
              </div>
            </div>
          </div>
          <div v-else class="empty">ルートが登録されていません</div>
          <button @click="addNewRoute" class="btn btn-primary">新しいルートを追加</button>
        </div>
        <div class="form-actions">
          <button @click="saveWall" class="btn btn-primary btn-large">保存</button>
          <button @click="goBack" class="btn btn-secondary btn-large">キャンセル</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import L from 'leaflet'
import { useAreas } from '../composables/useAreas'
import type { Wall } from '../types'

const routeParams = useRoute()
const router = useRouter()
const { areasData, loading, error, loadAreas, getArea } = useAreas()

const areaId = computed(() => routeParams.params.areaId as string)
const wallId = computed(() => routeParams.params.wallId as string)
const area = computed(() => getArea(areaId.value))
const isEdit = computed(() => !!wallId.value && wallId.value !== 'new')

const mapContainer = ref<HTMLDivElement | null>(null)
const wallName = ref('')
const selectedCoordinates = ref<[number, number] | null>(null)
let map: L.Map | null = null
let marker: L.Marker | null = null

const currentWall = computed(() => {
  if (!isEdit.value || !area.value) return null
  return area.value.walls.find(w => w.id === wallId.value)
})

onMounted(() => {
  if (isEdit.value && currentWall.value) {
    wallName.value = currentWall.value.name
    selectedCoordinates.value = [...currentWall.value.coordinates]
  }
  loadAreas().then(() => {
    initMap()
  })
})

const initMap = () => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([36.23, 43.2131], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)

  if (selectedCoordinates.value) {
    marker = L.marker(selectedCoordinates.value).addTo(map)
    map.setView(selectedCoordinates.value, 15)
  }

  map.on('click', (e: L.LeafletMouseEvent) => {
    const coords: [number, number] = [e.latlng.lat, e.latlng.lng]
    selectedCoordinates.value = coords

    if (marker) {
      marker.setLatLng(coords)
    } else {
      marker = L.marker(coords).addTo(map!)
    }
  })
}

const addNewRoute = () => {
  if (!currentWall.value && !isEdit.value) {
    alert('まず壁を保存してください')
    return
  }
  const targetWallId = isEdit.value ? wallId.value : 'new'
  router.push(`/admin/area/${areaId.value}/wall/${targetWallId}/route/new`)
}

const editRoute = (routeId: string) => {
  router.push(`/admin/area/${areaId.value}/wall/${wallId.value}/route/${routeId}/edit`)
}

const deleteRoute = (routeId: string) => {
  if (!confirm('このルートを削除しますか？')) return
  // TODO: 実際の削除処理を実装
  alert('削除機能は実装中です（JSONファイルの直接編集が必要）')
}

const saveWall = () => {
  if (!wallName.value.trim()) {
    alert('壁の名前を入力してください')
    return
  }
  if (!selectedCoordinates.value) {
    alert('地図上で壁の位置を選択してください')
    return
  }

  // TODO: 実際の保存処理を実装（JSONファイルへの書き込み）
  alert('保存機能は実装中です（JSONファイルの直接編集が必要）')
  console.log('Wall data:', {
    id: isEdit.value ? wallId.value : `wall_${Date.now()}`,
    name: wallName.value,
    coordinates: selectedCoordinates.value,
    routes: isEdit.value && currentWall.value ? currentWall.value.routes : []
  })
}

const goBack = () => {
  router.push(`/area/${areaId.value}`)
}
</script>

<style scoped>
.admin-wall-editor-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header h1 {
  font-size: 2rem;
  margin: 0;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error {
  color: #d32f2f;
}

.editor-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.map-container {
  width: 100%;
  height: 400px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.coordinates {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
}

.routes-list {
  margin: 1rem 0;
}

.route-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.route-actions {
  display: flex;
  gap: 0.5rem;
}

.empty {
  padding: 1rem;
  text-align: center;
  color: #999;
  background: #f9f9f9;
  border-radius: 4px;
  margin: 1rem 0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-large {
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .main-content {
    padding: 1rem;
  }

  .editor-content {
    padding: 1rem;
  }

  .map-container {
    height: 300px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-large {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .route-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .route-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

