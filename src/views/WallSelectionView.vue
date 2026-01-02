<template>
  <div class="wall-selection-view">
    <header class="header">
      <button @click="goBack" class="back-button">← 戻る</button>
      <h1>{{ area?.name || '壁を選択' }}</h1>
    </header>
    <main class="main-content">
      <div v-if="loading" class="loading">読み込み中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!area" class="error">エリアが見つかりません</div>
      <div v-else-if="area.walls.length === 0" class="empty">壁が登録されていません</div>
      <WallMap
        v-else
        :walls="area.walls"
        :on-wall-click="handleWallClick"
      />
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
const { areasData, loading, error, loadAreas, getArea } = useAreas()

const areaId = computed(() => routeParams.params.areaId as string)
const area = computed(() => getArea(areaId.value))

const handleWallClick = (wall: Wall) => {
  if (wall.routes.length === 0) {
    alert('この壁にはルートが登録されていません')
    return
  }

  if (wall.routes.length === 1) {
    router.push(`/area/${areaId.value}/wall/${wall.id}/route/${wall.routes[0].id}`)
  } else {
    // 複数のルートがある場合は最初のルートに遷移（将来的にルート選択画面を追加可能）
    router.push(`/area/${areaId.value}/wall/${wall.id}/route/${wall.routes[0].id}`)
  }
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
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error {
  color: #d32f2f;
}
</style>

