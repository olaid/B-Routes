<template>
  <div class="wall-routes-view">
    <header class="header">
      <button type="button" class="back-button" @click="goBack">← 戻る</button>
      <div class="header-text">
        <h1>{{ wall?.name || 'ルート一覧' }}</h1>
        <p v-if="area" class="area-label">{{ area.name }}</p>
      </div>
      <router-link
        v-if="wall && area"
        class="header-admin-link"
        :to="{
          name: 'admin-wall-edit',
          params: { areaId: areaId, wallId: wallId }
        }"
      >
        壁・ルートを管理
      </router-link>
    </header>
    <main class="main-content">
      <div v-if="loading" class="state">読み込み中...</div>
      <div v-else-if="error" class="state error">{{ error }}</div>
      <div v-else-if="!wall" class="state error">壁が見つかりません</div>
      <div v-else-if="wall.routes.length === 0" class="state">この壁にはルートがまだありません</div>
      <ul v-else class="route-list" role="list">
        <li
          v-for="r in wall.routes"
          :key="r.id"
          class="route-card"
          role="listitem"
          tabindex="0"
          @click="openRoute(r.id)"
          @keydown.enter.prevent="openRoute(r.id)"
        >
          <div class="route-card-body">
            <span class="route-name">{{ r.name }}</span>
            <span v-if="r.difficulty" class="route-grade">{{ r.difficulty }}</span>
          </div>
          <span class="chevron" aria-hidden="true">›</span>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAreas } from '../composables/useAreas'

const route = useRoute()
const router = useRouter()
const { loading, error, loadAreas, getArea, getWall } = useAreas()

const areaId = computed(() => route.params.areaId as string)
const wallId = computed(() => route.params.wallId as string)
const area = computed(() => getArea(areaId.value))
const wall = computed(() => getWall(areaId.value, wallId.value))

const goBack = () => {
  router.push(`/area/${areaId.value}`)
}

const openRoute = (routeId: string) => {
  router.push(`/area/${areaId.value}/wall/${wallId.value}/route/${routeId}`)
}

loadAreas()
</script>

<style scoped>
.wall-routes-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--br-surface-muted, #f0f2f8);
}

.header {
  background: linear-gradient(135deg, #0d9488 0%, #115e59 100%);
  color: #fff;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-admin-link {
  margin-left: auto;
  padding: 0.45rem 0.95rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.95);
  color: #115e59;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.55);
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.header-admin-link:hover {
  background: #fff;
  color: #0f766e;
}

.back-button {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.25);
}

.header-text h1 {
  margin: 0;
  font-size: 1.65rem;
  font-weight: 700;
}

.area-label {
  margin: 0.25rem 0 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
}

.state {
  text-align: center;
  padding: 2rem 1rem;
  font-size: 1.05rem;
  color: #475569;
}

.state.error {
  color: #b91c1c;
}

.route-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.route-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.15rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.route-card:hover,
.route-card:focus-visible {
  outline: none;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
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
  font-size: 1.1rem;
  color: #0f172a;
}

.route-grade {
  font-size: 0.9rem;
  color: #0d9488;
  font-weight: 600;
}

.chevron {
  font-size: 1.5rem;
  color: #94a3b8;
  line-height: 1;
}

@media (max-width: 480px) {
  .header-text h1 {
    font-size: 1.25rem;
  }

  .header-admin-link {
    margin-left: 0;
    width: 100%;
    text-align: center;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>
