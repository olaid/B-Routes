<template>
  <div class="route-canvas-container">
    <img
      :src="props.route.imageUrl"
      alt="Route image"
      class="route-image"
      @error="onImageError"
    />
    <svg
      class="route-overlay"
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      :class="{ 'route-overlay-interactive': props.interactive }"
      @click="handleCanvasClick"
    >
      <polyline
        v-for="(line, index) in props.route.vectors.lines"
        :key="`line-${index}`"
        :points="toSvgPoints(line.points)"
        :stroke="line.color || '#ef4444'"
        :stroke-width="(line.width || 3) / 500"
        vector-effect="non-scaling-stroke"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <g v-for="(point, index) in props.route.vectors.startHolds" :key="`hold-${index}`">
        <circle
          :cx="point.position[0]"
          :cy="point.position[1]"
          r="0.022"
          :fill="point.type === 'start' ? '#22c55e' : point.type === 'finish' ? '#ef4444' : '#3b82f6'"
          stroke="#fff"
          stroke-width="0.006"
        />
        <text
          v-if="point.label"
          :x="point.position[0]"
          :y="point.position[1]"
          text-anchor="middle"
          dominant-baseline="middle"
          class="hold-label"
        >
          {{ point.label }}
        </text>
      </g>
      <g v-for="(keyPoint, index) in props.route.vectors.keyPoints" :key="`key-${index}`">
        <circle
          :cx="keyPoint.position[0]"
          :cy="keyPoint.position[1]"
          r="0.018"
          fill="#facc15"
          stroke="#0f172a"
          stroke-width="0.005"
        />
        <title>{{ keyPoint.description }}</title>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
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

const onImageError = () => {
  console.error('Failed to load image:', props.route.imageUrl)
}

const toSvgPoints = (points: [number, number][]) => {
  return points.map(([x, y]) => `${x},${y}`).join(' ')
}

const handleCanvasClick = (event: MouseEvent) => {
  if (!props.interactive) return

  const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height

  emit('click', x, y)
}
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

.route-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: default;
}

.route-overlay-interactive {
  cursor: crosshair;
}

.hold-label {
  fill: #fff;
  font-size: 0.026px;
  font-weight: 800;
  paint-order: stroke;
  stroke: rgba(15, 23, 42, 0.65);
  stroke-width: 0.004px;
}

@media (max-width: 768px) {
  .route-canvas-container {
    border-radius: 4px;
  }
}
</style>

