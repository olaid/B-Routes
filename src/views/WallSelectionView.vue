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
        <WallMap
          :walls="area.walls"
          :area-polygon="area.polygon"
          :on-wall-click="handleWallClick"
        />
        <section class="wall-admin-panel" aria-label="壁の管理">
          <h2 class="wall-admin-heading">壁の一覧</h2>
          <p class="wall-admin-hint">地図のピンをタップするとルート一覧へ進みます。</p>
          <ul class="wall-admin-list">
            <li v-for="w in area.walls" :key="w.id" class="wall-admin-item">
              <span class="wall-admin-name">{{ w.name }}</span>
              <div class="wall-admin-actions">
                <router-link
                  class="wall-admin-link"
                  :to="`/area/${areaId}/wall/${w.id}`"
                >
                  ルート一覧
                </router-link>
                <router-link
                  class="wall-admin-link wall-admin-link--emphasis"
                  :to="{
                    name: 'admin-wall-edit',
                    params: { areaId: areaId, wallId: w.id }
                  }"
                >
                  管理で編集
                </router-link>
              </div>
            </li>
          </ul>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAreas } from '../composables/useAreas'
import WallMap from '../components/WallMap.vue'
import type { Wall } from '../types'

const routeParams = useRoute()
const router = useRouter()
const { loading, error, loadAreas, getArea } = useAreas()

const areaId = computed(() => routeParams.params.areaId as string)
const area = computed(() => getArea(areaId.value))

const handleWallClick = (wall: Wall) => {
  router.push(`/area/${areaId.value}/wall/${wall.id}`)
}

const goBack = () => {
  router.push('/')
}

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
  gap: 0.65rem;
}

.wall-admin-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.wall-admin-name {
  font-weight: 600;
  color: #0f172a;
}

.wall-admin-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.wall-admin-link {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
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

  .wall-admin-actions {
    justify-content: flex-end;
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

