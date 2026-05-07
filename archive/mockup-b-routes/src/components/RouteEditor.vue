<template>
  <div class="route-editor">
    <div class="canvas-wrapper">
      <img
        ref="imageRef"
        :src="imageUrl"
        alt="Route image"
        class="editor-image"
        @load="onImageLoad"
        @error="onImageError"
      />
      <canvas
        ref="canvasRef"
        class="editor-canvas"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @click="handleClick"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Line, Point, KeyPoint } from '../types'

interface Props {
  imageUrl: string
  initialVectors?: {
    lines: Line[]
    startHolds: Point[]
    keyPoints: KeyPoint[]
  }
  mode: 'line' | 'point' | 'keypoint'
}

const props = withDefaults(defineProps<Props>(), {
  initialVectors: () => ({
    lines: [],
    startHolds: [],
    keyPoints: []
  })
})

const emit = defineEmits<{
  vectorsUpdated: [vectors: {
    lines: Line[]
    startHolds: Point[]
    keyPoints: KeyPoint[]
  }]
}>()

const imageRef = ref<HTMLImageElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const vectors = ref<{
  lines: Line[]
  startHolds: Point[]
  keyPoints: KeyPoint[]
}>({
  lines: [],
  startHolds: [],
  keyPoints: []
})

let isDrawing = false
let currentLine: Line | null = null
let imageLoaded = false

const onImageLoad = () => {
  imageLoaded = true
  drawVectors()
}

const onImageError = () => {
  console.error('Failed to load image')
}

const getNormalizedCoordinates = (event: MouseEvent): [number, number] | null => {
  if (!canvasRef.value || !imageRef.value) return null

  const rect = canvasRef.value.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height

  return [x, y]
}

const drawVectors = () => {
  if (!canvasRef.value || !imageRef.value || !imageLoaded) return

  const canvas = canvasRef.value
  const img = imageRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // キャンバスサイズを画像サイズに合わせる
  canvas.width = img.width
  canvas.height = img.height

  // クリア
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // ルートの線を描画
  vectors.value.lines.forEach(line => {
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
  vectors.value.startHolds.forEach(point => {
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
  vectors.value.keyPoints.forEach(keyPoint => {
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

const handleMouseDown = (event: MouseEvent) => {
  if (props.mode !== 'line') return

  const coords = getNormalizedCoordinates(event)
  if (!coords) return

  isDrawing = true
  currentLine = {
    points: [coords],
    color: '#ff0000',
    width: 3
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isDrawing || !currentLine || props.mode !== 'line') return

  const coords = getNormalizedCoordinates(event)
  if (!coords) return

  currentLine.points.push(coords)
  drawVectors()

  // 現在描画中の線を描画
  if (canvasRef.value && currentLine.points.length > 1) {
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.strokeStyle = currentLine.color || '#ff0000'
      ctx.lineWidth = currentLine.width || 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const firstPoint = currentLine.points[0]
      const x = firstPoint[0] * canvasRef.value.width
      const y = firstPoint[1] * canvasRef.value.height
      ctx.moveTo(x, y)

      for (let i = 1; i < currentLine.points.length; i++) {
        const point = currentLine.points[i]
        const px = point[0] * canvasRef.value.width
        const py = point[1] * canvasRef.value.height
        ctx.lineTo(px, py)
      }

      ctx.stroke()
    }
  }
}

const handleMouseUp = () => {
  if (isDrawing && currentLine && currentLine.points.length > 1) {
    vectors.value.lines.push(currentLine)
    emit('vectorsUpdated', { ...vectors.value })
  }
  isDrawing = false
  currentLine = null
  drawVectors()
}

const handleClick = (event: MouseEvent) => {
  if (isDrawing) return

  const coords = getNormalizedCoordinates(event)
  if (!coords) return

  if (props.mode === 'point') {
    vectors.value.startHolds.push({
      position: coords,
      type: 'start',
      label: 'S'
    })
    emit('vectorsUpdated', { ...vectors.value })
    drawVectors()
  } else if (props.mode === 'keypoint') {
    const description = prompt('重要なポイントの説明を入力してください:')
    if (description) {
      vectors.value.keyPoints.push({
        position: coords,
        description: description
      })
      emit('vectorsUpdated', { ...vectors.value })
      drawVectors()
    }
  }
}

watch(() => props.initialVectors, (newVectors) => {
  if (newVectors) {
    vectors.value = {
      lines: [...newVectors.lines],
      startHolds: [...newVectors.startHolds],
      keyPoints: [...newVectors.keyPoints]
    }
    drawVectors()
  }
}, { deep: true, immediate: true })

onMounted(() => {
  if (imageRef.value?.complete) {
    onImageLoad()
  }
})
</script>

<style scoped>
.route-editor {
  width: 100%;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
  background: #f5f5f5;
}

.editor-image {
  width: 100%;
  height: auto;
  display: block;
}

.editor-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
</style>

