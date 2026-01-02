<template>
  <div class="route-detail-view">
    <header class="header">
      <button @click="goBack" class="back-button">← 戻る</button>
      <div class="header-content">
        <h1>{{ route?.name || 'ルート詳細' }}</h1>
        <p v-if="route?.difficulty" class="difficulty">難易度: {{ route.difficulty }}</p>
      </div>
    </header>
    <main class="main-content">
      <div v-if="loading" class="loading">読み込み中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!route" class="error">ルートが見つかりません</div>
      <div v-else class="route-content">
        <RouteCanvas :route="route" />
        <div v-if="route.description" class="description">
          <h2>説明</h2>
          <p>{{ route.description }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAreas } from '../composables/useAreas'
import RouteCanvas from '../components/RouteCanvas.vue'

const routeParams = useRoute()
const router = useRouter()
const { loading, error, loadAreas, getRoute } = useAreas()

const areaId = computed(() => routeParams.params.areaId as string)
const wallId = computed(() => routeParams.params.wallId as string)
const routeId = computed(() => routeParams.params.routeId as string)
const route = computed(() => getRoute(areaId.value, wallId.value, routeId.value))

const goBack = () => {
  router.push(`/area/${areaId.value}`)
}

loadAreas()
</script>

<style scoped>
.route-detail-view {
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

.header-content {
  flex: 1;
}

.header h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.difficulty {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .difficulty {
    font-size: 1rem;
  }

  .main-content {
    padding: 1rem;
  }

  .route-content {
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

  .back-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
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

.route-content {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.description {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.description h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.description p {
  line-height: 1.6;
  color: #666;
}
</style>

