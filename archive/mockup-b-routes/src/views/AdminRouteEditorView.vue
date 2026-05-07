<template>
  <div class="admin-route-editor-view">
    <header class="header">
      <button @click="goBack" class="back-button">← 戻る</button>
      <h1>{{ isEdit ? 'ルートを編集' : 'ルートを追加' }}</h1>
    </header>
    <main class="main-content">
      <div v-if="loading" class="loading">読み込み中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="!areaResolved" class="error">エリアが見つかりません</div>
      <div v-else-if="wallMissing" class="error">
        壁が見つかりません。壁の管理画面からやり直してください。
      </div>
      <div v-else-if="routeMissing" class="error">
        ルートが見つかりません。URL が古いか、データが削除された可能性があります。
      </div>
      <div v-else class="editor-content">
        <div class="form-section">
          <label>
            ルート名:
            <input v-model="routeName" type="text" class="input" />
          </label>
        </div>
        <div class="form-section">
          <label>
            難易度:
            <input v-model="difficulty" type="text" class="input" placeholder="例: V3, 5.10a" />
          </label>
        </div>
        <div class="form-section">
          <label>
            説明:
            <textarea v-model="description" class="textarea" rows="4"></textarea>
          </label>
        </div>
        <div class="form-section">
          <label>
            画像URL:
            <input v-model="imageUrl" type="text" class="input" />
          </label>
          <div v-if="showStorageUpload" class="upload-row">
            <label class="upload-label">画像ファイルをアップロード（Storage）</label>
            <input
              type="file"
              accept="image/*"
              class="file-input"
              :disabled="uploadBusy"
              @change="onImageFile"
            />
            <p v-if="uploadBusy" class="hint">アップロード中…</p>
          </div>
          <div v-if="imageUrl" class="image-preview">
            <img :src="imageUrl" alt="Route preview" @error="imageError = true" />
            <div v-if="imageError" class="image-error">画像の読み込みに失敗しました</div>
          </div>
        </div>
        <div class="form-section">
          <h3>ベクターデータ編集</h3>
          <div class="toolbar">
            <button
              @click="mode = 'line'"
              :class="['btn', mode === 'line' ? 'btn-active' : 'btn-secondary']"
            >
              線を描画
            </button>
            <button
              @click="mode = 'point'"
              :class="['btn', mode === 'point' ? 'btn-active' : 'btn-secondary']"
            >
              ポイント追加
            </button>
            <button
              @click="mode = 'keypoint'"
              :class="['btn', mode === 'keypoint' ? 'btn-active' : 'btn-secondary']"
            >
              重要ポイント追加
            </button>
            <button @click="clearAll" class="btn btn-danger">すべてクリア</button>
          </div>
          <div v-if="imageUrl" class="canvas-container">
            <RouteEditor
              :image-url="imageUrl"
              :initial-vectors="currentVectors"
              :mode="mode"
              @vectors-updated="handleVectorsUpdate"
            />
          </div>
          <div v-else class="empty">画像URLを入力してください</div>
        </div>
        <div class="form-actions">
          <button
            type="button"
            class="btn btn-primary btn-large"
            :disabled="savingRoute"
            @click="submitRoute"
          >
            {{ savingRoute ? '保存中…' : '保存' }}
          </button>
          <button type="button" class="btn btn-secondary btn-large" @click="goBack">キャンセル</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAreas } from '../composables/useAreas'
import { useRouteEditor } from '../composables/useRouteEditor'
import { uploadRouteImage } from '../lib/areasRepository'
import { isSupabaseConfigured } from '../lib/supabase'
import RouteEditor from '../components/RouteEditor.vue'
import type { Route, Line, Point, KeyPoint } from '../types'

const routeParams = useRoute()
const router = useRouter()
const { loading, error, loadAreas, getArea, getWall, getRoute } = useAreas()
const { saving: savingRoute, saveRoute: persistRouteToDb } = useRouteEditor()

const showStorageUpload = computed(() => isSupabaseConfigured())
const uploadBusy = ref(false)

const areaId = computed(() => routeParams.params.areaId as string)
const wallId = computed(() => routeParams.params.wallId as string)
const routeId = computed(() => routeParams.params.routeId as string)
const isEdit = computed(() => !!routeId.value && routeId.value !== 'new')

const routeName = ref('')
const difficulty = ref('')
const description = ref('')
const imageUrl = ref('')
const imageError = ref(false)
const mode = ref<'line' | 'point' | 'keypoint'>('line')

const currentVectors = ref<{
  lines: Line[]
  startHolds: Point[]
  keyPoints: KeyPoint[]
}>({
  lines: [],
  startHolds: [],
  keyPoints: []
})

const areaResolved = computed(() => getArea(areaId.value))

const wallMissing = computed(() => {
  if (!areaResolved.value || wallId.value === 'new') return false
  return !getWall(areaId.value, wallId.value)
})

const currentRoute = computed(() => {
  if (!isEdit.value) return null
  return getRoute(areaId.value, wallId.value, routeId.value)
})

const routeMissing = computed(() => {
  if (!isEdit.value || wallMissing.value || wallId.value === 'new') return false
  return !currentRoute.value
})

onMounted(() => {
  loadAreas().then(() => {
    if (isEdit.value && currentRoute.value) {
      routeName.value = currentRoute.value.name
      difficulty.value = currentRoute.value.difficulty || currentRoute.value.grade || ''
      description.value = currentRoute.value.description || currentRoute.value.comment || ''
      imageUrl.value = currentRoute.value.imageUrl
      currentVectors.value = {
        lines: [...currentRoute.value.vectors.lines],
        startHolds: [...currentRoute.value.vectors.startHolds],
        keyPoints: [...currentRoute.value.vectors.keyPoints]
      }
    }
  })
})

const onImageFile = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !isSupabaseConfigured()) return
  uploadBusy.value = true
  imageError.value = false
  try {
    imageUrl.value = await uploadRouteImage(file, wallId.value)
  } catch (err) {
    alert(err instanceof Error ? err.message : 'アップロードに失敗しました')
  } finally {
    uploadBusy.value = false
    input.value = ''
  }
}

const handleVectorsUpdate = (vectors: typeof currentVectors.value) => {
  currentVectors.value = vectors
}

const clearAll = () => {
  if (!confirm('すべてのベクターデータを削除しますか？')) return
  currentVectors.value = {
    lines: [],
    startHolds: [],
    keyPoints: []
  }
}

const submitRoute = async () => {
  if (wallId.value === 'new') {
    alert('先に壁を保存してからルートを追加してください。')
    return
  }
  if (!routeName.value.trim()) {
    alert('ルート名を入力してください')
    return
  }
  if (!imageUrl.value.trim()) {
    alert('画像URLを入力するか、画像をアップロードしてください')
    return
  }
  if (!isSupabaseConfigured()) {
    alert(
      'Supabase が未設定のため保存できません。.env.example を参照し、マイグレーションを実行してください。'
    )
    return
  }

  const id = isEdit.value ? routeId.value : crypto.randomUUID()
  const payload: Route & { wallId: string } = {
    id,
    wallId: wallId.value,
    name: routeName.value.trim(),
    difficulty: difficulty.value || undefined,
    grade: difficulty.value || undefined,
    comment: description.value || undefined,
    description: description.value || undefined,
    imageUrl: imageUrl.value.trim(),
    vectors: JSON.parse(JSON.stringify(currentVectors.value)) as Route['vectors']
  }

  try {
    await persistRouteToDb(payload)
    await loadAreas()
    alert('保存しました')
    await router.push(`/admin/area/${areaId.value}/wall/${wallId.value}/edit`)
  } catch (e) {
    alert(e instanceof Error ? e.message : '保存に失敗しました')
  }
}

const goBack = () => {
  router.push(`/admin/area/${areaId.value}/wall/${wallId.value}/edit`)
}
</script>

<style scoped>
.admin-route-editor-view {
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
  max-width: 1400px;
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

.form-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.input,
.textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-top: 0.5rem;
  font-family: inherit;
}

.textarea {
  resize: vertical;
}

.image-preview {
  margin-top: 1rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.image-error {
  padding: 1rem;
  text-align: center;
  color: #d32f2f;
  background: #ffebee;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.canvas-container {
  border: 2px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f5f5;
}

.upload-row {
  margin-top: 1rem;
}

.upload-label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.95rem;
  color: #555;
}

.file-input {
  font-size: 0.95rem;
}

.hint {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.empty {
  padding: 2rem;
  text-align: center;
  color: #999;
  background: #f9f9f9;
  border-radius: 4px;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-active {
  background: #667eea;
  color: white;
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

  .toolbar {
    flex-direction: column;
  }

  .toolbar .btn {
    width: 100%;
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

  .header h1 {
    font-size: 1.2rem;
  }
}
</style>

