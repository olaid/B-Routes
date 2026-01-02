<template>
  <div class="area-selection-view">
    <header class="header">
      <h1>B-Routes</h1>
      <p class="subtitle">エリアを選択してください</p>
    </header>
    <main class="main-content">
      <div v-if="loading" class="loading">読み込み中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <AreaMap
        v-else-if="areasData"
        :areas="areasData.areas"
        :on-area-click="handleAreaClick"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAreas } from '../composables/useAreas'
import AreaMap from '../components/AreaMap.vue'
import type { Area } from '../types'

const router = useRouter()
const { areasData, loading, error, loadAreas } = useAreas()

const handleAreaClick = (area: Area) => {
  router.push(`/area/${area.id}`)
}

loadAreas()
</script>

<style scoped>
.area-selection-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

@media (max-width: 768px) {
  .header {
    padding: 1.5rem 1rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .main-content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 1.5rem;
  }

  .subtitle {
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
</style>

