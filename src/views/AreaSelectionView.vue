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
      <details
        v-if="areasData && areasData.areas.length > 0"
        class="admin-shortcuts"
      >
        <summary class="admin-shortcuts-summary">壁・ルートの登録（管理）</summary>
        <p class="admin-shortcuts-intro">
          エリアを開かずに壁の追加画面へ進むショートカットです（保存には Supabase の設定が必要です）。
        </p>
        <ul class="admin-shortcuts-list">
          <li v-for="a in areasData.areas" :key="a.id">
            <router-link
              class="admin-shortcuts-link"
              :to="{ name: 'admin-wall-new', params: { areaId: a.id } }"
            >
              {{ a.name }} — 壁を追加
            </router-link>
          </li>
        </ul>
      </details>
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
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.admin-shortcuts {
  max-width: 42rem;
  margin: 0 auto;
  width: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem 1.25rem 1.25rem;
}

.admin-shortcuts-summary {
  cursor: pointer;
  font-weight: 600;
  color: #334155;
  padding: 0.35rem 0;
}

.admin-shortcuts-intro {
  margin: 0.5rem 0 0.75rem;
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
}

.admin-shortcuts-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.admin-shortcuts-link {
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: #fff;
  color: #5b21b6;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid #e2e8f0;
  transition: background 0.15s, border-color 0.15s;
}

.admin-shortcuts-link:hover {
  background: rgba(102, 126, 234, 0.08);
  border-color: rgba(102, 126, 234, 0.35);
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

