<template>
  <div class="route-canvas-container">
    <img
      ref="imageRef"
      :src="props.route.imageUrl"
      alt="Route image"
      class="route-image"
      @load="onImageLoad"
      @error="onImageError"
    />
    <canvas
      ref="canvasRef"
      :class="['route-canvas', { 'route-canvas-interactive': props.interactive }]"
      @click="handleCanvasClick"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Route } from '../types'

interface Props {
  route: Route
  interactive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  interactive: false
})

const emit = defineEmits<{
  click: [x: number, y: number]
}>()

const imageRef = ref<HTMLImageElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const onImageLoad = () => {
  drawVectors()
}

const onImageError = () => {
  console.error('Failed to load image:', props.route.imageUrl)
}

const drawVectors = () => {
  if (!canvasRef.value || !imageRef.value) return

  const canvas = canvasRef.value
  const img = imageRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // キャンバスサイズを画像サイズに合わせる
  canvas.width = img.width
  canvas.height = img.height

  // ルートの線を描画
  props.route.vectors.lines.forEach(line => {
    if (line.points.length < 2) return

    ctx.beginPath()
    ctx.strokeStyle = line.color || '#ff0000'
    ctx.lineWidth = line.width || 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const firstPoint = line.points[0]
    const x = firstPoint[0] * canvas.width
    const y = firstPoint[1] * canvas.height
    ctx.moveTo(x, y)

    for (let i = 1; i < line.points.length; i++) {
      const point = line.points[i]
      const px = point[0] * canvas.width
      const py = point[1] * canvas.height
      ctx.lineTo(px, py)
    }

    ctx.stroke()
  })

  // スタートホールドを描画
  props.route.vectors.startHolds.forEach(point => {
    const x = point.position[0] * canvas.width
    const y = point.position[1] * canvas.height

    ctx.beginPath()
    ctx.arc(x, y, 15, 0, 2 * Math.PI)
    ctx.fillStyle = point.type === 'start' ? '#00ff00' : point.type === 'finish' ? '#ff0000' : '#0000ff'
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    if (point.label) {
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(point.label, x, y)
    }
  })

  // 重要なポイントを描画
  props.route.vectors.keyPoints.forEach(keyPoint => {
    const x = keyPoint.position[0] * canvas.width
    const y = keyPoint.position[1] * canvas.height

    ctx.beginPath()
    ctx.arc(x, y, 10, 0, 2 * Math.PI)
    ctx.fillStyle = '#ffff00'
    ctx.fill()
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.stroke()
  })
}

const handleCanvasClick = (event: MouseEvent) => {
  if (!props.interactive || !canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height

  emit('click', x, y)
}

watch(() => props.route, () => {
  drawVectors()
}, { deep: true })

onMounted(() => {
  if (imageRef.value?.complete) {
    onImageLoad()
  }
})
</script>

<style scoped>
.route-canvas-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.route-image {
  width: 100%;
  height: auto;
  display: block;
}

.route-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: default;
}

.route-canvas-interactive {
  cursor: crosshair;
}

@media (max-width: 768px) {
  .route-canvas-container {
    border-radius: 4px;
  }
}
</style>

