<template>
  <div class="wall-selection-view">
    <header class="header">
      <button @click="goBack" class="back-button">← 戻る</button>
      <h1 class="header-title">{{ area?.name || '壁を選択' }}</h1>
      <router-link
        v-if="area"
        class="admin-cta"
        :to="{ name: 'admin-wall-new', params: { areaId: areaId } }"
      >
        壁を追加
      </router-link>
    </header>
    <main class="main-content">
      <div v-if="loading" class="loading">読み込み中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!area" class="error">エリアが見つかりません</div>
      <template v-else-if="area.walls.length === 0">
        <div class="empty">
          <p>壁が登録されていません</p>
          <router-link
            class="empty-admin-link"
            :to="{ name: 'admin-wall-new', params: { areaId: areaId } }"
          >
            管理画面で壁を追加
          </router-link>
        </div>
      </template>
      <template v-else>
        <div class="map-wrapper">
          <WallMap
            :walls="area.walls"
            :area-polygon="area.polygon"
            :selected-wall-id="selectedWall?.id"
            :on-wall-click="handleWallClick"
          />
          <div v-if="selectedWall" class="map-overlay">
            <BearingPanel :wall="selectedWall" />
          </div>
        </div>

        <section v-if="selectedWall" class="routes-panel" aria-label="選択した壁のルート一覧">
          <div class="routes-header">
            <div>
              <p class="eyebrow">選択中の壁</p>
              <h2>{{ selectedWall.name }}</h2>
            </div>
            <router-link
              class="manage-link"
              :to="{
                name: 'admin-wall-edit',
                params: { areaId: areaId, wallId: selectedWall.id }
              }"
            >
              壁・ルートを管理
            </router-link>
          </div>
          <p v-if="selectedWall.routes.length === 0" class="empty-routes">
            この壁にはルートがまだ登録されていません。
          </p>
          <ul v-else class="route-list" role="list">
            <li
              v-for="r in selectedWall.routes"
              :key="r.id"
              class="route-card"
              role="listitem"
              tabindex="0"
              @click="openRoute(r.id)"
              @keydown.enter.prevent="openRoute(r.id)"
            >
              <div class="route-card-body">
                <span class="route-name">{{ r.name }}</span>
                <span v-if="r.difficulty || r.grade" class="route-grade">
                  {{ r.difficulty || r.grade }}
                </span>
              </div>
              <span class="chevron" aria-hidden="true">›</span>
            </li>
          </ul>
        </section>

        <section class="wall-admin-panel" aria-label="壁の管理">
          <h2 class="wall-admin-heading">壁の一覧</h2>
          <p class="wall-admin-hint">地図のピンまたは下記の一覧から壁を選択してください。</p>
          <ul class="wall-admin-list">
            <li
              v-for="w in area.walls"
              :key="w.id"
              :class="['wall-admin-item', { 'wall-admin-item--active': selectedWall?.id === w.id }]"
            >
              <button
                type="button"
                class="wall-admin-name"
                @click="selectWall(w)"
              >
                {{ w.name }}
              </button>
              <router-link
                class="wall-admin-link wall-admin-link--emphasis"
                :to="{
                  name: 'admin-wall-edit',
                  params: { areaId: areaId, wallId: w.id }
                }"
              >
                管理で編集
              </router-link>
            </li>
          </ul>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useAreas } from '../composables/useAreas'
import WallMap from '../components/WallMap.vue'
import BearingPanel from '../components/BearingPanel.vue'
import type { Wall } from '../types'

const routeParams = useRoute()
const router = useRouter()
const { loading, error, loadAreas, getArea } = useAreas()

const areaId = computed(() => routeParams.params.areaId as string)
const area = computed(() => getArea(areaId.value))
const selectedWallId = ref<string | null>(null)
const selectedWall = computed(() => {
  if (!area.value || !selectedWallId.value) return null
  return area.value.walls.find((wall) => wall.id === selectedWallId.value) ?? null
})

const handleWallClick = (wall: Wall) => {
  selectWall(wall)
}

const selectWall = (wall: Wall) => {
  selectedWallId.value = wall.id
}

const openRoute = (routeId: string) => {
  if (!selectedWall.value) return
  router.push(`/area/${areaId.value}/wall/${selectedWall.value.id}/route/${routeId}`)
}

const goBack = () => {
  router.push('/')
}

watch(area, (nextArea) => {
  if (!nextArea || nextArea.walls.length === 0) {
    selectedWallId.value = null
    return
  }
  if (!selectedWallId.value || !nextArea.walls.some((wall) => wall.id === selectedWallId.value)) {
    selectedWallId.value = nextArea.walls[0].id
  }
})

loadAreas()
</script>

<style scoped>
.wall-selection-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-title {
  flex: 1;
  min-width: 0;
}

.admin-cta {
  margin-left: auto;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.95);
  color: #5b21b6;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}

.admin-cta:hover {
  background: #fff;
  color: #4c1d95;
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
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.map-wrapper {
  position: relative;
  width: 100%;
}

.map-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 500;
  pointer-events: auto;
}

.routes-panel {
  background: #fff;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.routes-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.routes-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #0f172a;
}

.eyebrow {
  margin: 0 0 0.15rem;
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.manage-link {
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  background: rgba(13, 148, 136, 0.12);
  color: #0f766e;
  border: 1px solid rgba(13, 148, 136, 0.35);
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  white-space: nowrap;
}

.manage-link:hover {
  background: rgba(13, 148, 136, 0.22);
}

.empty-routes {
  margin: 0;
  color: #64748b;
}

.route-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.route-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.route-card:hover,
.route-card:focus-visible {
  outline: none;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1);
  transform: translateY(-1px);
}

.route-card-body {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 1rem;
}

.route-name {
  font-weight: 600;
  font-size: 1.05rem;
  color: #0f172a;
}

.route-grade {
  font-size: 0.85rem;
  color: #0d9488;
  font-weight: 700;
}

.chevron {
  font-size: 1.5rem;
  color: #94a3b8;
  line-height: 1;
}

.wall-admin-panel {
  background: #fff;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
}

.wall-admin-heading {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  color: #0f172a;
}

.wall-admin-hint {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  color: #64748b;
}

.wall-admin-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.wall-admin-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.9rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.wall-admin-item--active {
  background: rgba(13, 148, 136, 0.08);
  border-color: rgba(13, 148, 136, 0.4);
}

.wall-admin-name {
  flex: 1;
  text-align: left;
  border: 0;
  background: transparent;
  font: inherit;
  font-weight: 600;
  color: #0f172a;
  cursor: pointer;
  padding: 0.25rem 0;
}

.wall-admin-name:focus-visible {
  outline: 2px solid #0d9488;
  outline-offset: 2px;
  border-radius: 4px;
}

.wall-admin-link {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  color: #5b21b6;
  background: rgba(102, 126, 234, 0.12);
  border: 1px solid rgba(102, 126, 234, 0.35);
  transition: background 0.15s;
}

.wall-admin-link:hover {
  background: rgba(102, 126, 234, 0.2);
}

.wall-admin-link--emphasis {
  color: #0f766e;
  background: rgba(13, 148, 136, 0.12);
  border-color: rgba(13, 148, 136, 0.35);
}

.wall-admin-link--emphasis:hover {
  background: rgba(13, 148, 136, 0.2);
}

.empty {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty p {
  margin: 0;
}

.empty-admin-link {
  display: inline-block;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
}

.empty-admin-link:hover {
  filter: brightness(1.05);
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .back-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }

  .main-content {
    padding: 1rem;
  }

  .map-overlay {
    top: 8px;
    right: 8px;
    left: 8px;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .header h1 {
    font-size: 1.2rem;
  }

  .admin-cta {
    margin-left: 0;
    width: 100%;
    text-align: center;
  }

  .wall-admin-item {
    flex-direction: column;
    align-items: stretch;
  }

  .routes-header {
    flex-direction: column;
    align-items: stretch;
  }

  .manage-link {
    text-align: center;
  }
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
</style>
