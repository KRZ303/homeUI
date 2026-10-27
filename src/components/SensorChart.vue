<script setup lang="ts">
import { computed } from 'vue'
import type { SensorSeries } from '../types'
import { clamp } from '../utils/format'

const props = withDefaults(
  defineProps<{
    series: SensorSeries[]
    steppedAreaPoints?: number[]
    rightMin?: number
    rightMax?: number
    hoverIdx?: number | null
    height?: number
    separateAxes?: boolean
  }>(),
  {
    steppedAreaPoints: undefined,
    rightMin: 0,
    rightMax: 110,
    hoverIdx: null,
    height: 68,
    separateAxes: false,
  },
)

const emit = defineEmits<{
  (event: 'hover', index: number | null): void
}>()

const W = 300
const H = 100
const PAD = 8

const values = computed(() => props.series.flatMap((entry) => entry.points))
const minValue = computed(() => (values.value.length ? Math.min(...values.value) : 0))
const maxValue = computed(() => (values.value.length ? Math.max(...values.value) : 1))

function px(index: number, count: number): number {
  return count <= 1 ? 0 : (index / (count - 1)) * W
}

function py(value: number, seriesIndex = 0): number {
  const entry = props.series[seriesIndex]
  const domainMin =
    props.separateAxes && entry ? Math.min(...entry.points) : minValue.value
  const domainMax =
    props.separateAxes && entry ? Math.max(...entry.points) : maxValue.value
  const range = domainMax - domainMin || 1
  const normal = (value - domainMin) / range
  return PAD + (1 - normal) * (H - PAD * 2)
}

function smoothPath(points: number[], seriesIndex = 0): string {
  if (!points.length) return ''
  const count = points.length
  let path = `M ${px(0, count)} ${py(points[0], seriesIndex)}`
  for (let index = 1; index < count; index += 1) {
    const x0 = px(index - 1, count)
    const x1 = px(index, count)
    const y0 = py(points[index - 1], seriesIndex)
    const y1 = py(points[index], seriesIndex)
    const cx = (x0 + x1) / 2
    path += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`
  }
  return path
}

function areaPath(points: number[], seriesIndex = 0): string {
  return `${smoothPath(points, seriesIndex)} L ${W} ${H} L 0 ${H} Z`
}

const steppedPath = computed(() => {
  const points = props.steppedAreaPoints
  if (!points?.length) return ''
  const count = points.length
  const range = props.rightMax - props.rightMin || 1
  const yOf = (value: number) => {
    const normal = clamp((value - props.rightMin) / range, 0, 1)
    return PAD + (1 - normal) * (H - PAD * 2)
  }
  let path = `M 0 ${H} L 0 ${yOf(points[0])}`
  for (let index = 0; index < count; index += 1) {
    const x0 = px(index, count)
    const x1 = index === count - 1 ? W : px(index + 1, count)
    const y = yOf(points[index])
    path += ` L ${x0} ${y} L ${x1} ${y}`
  }
  path += ` L ${W} ${H} Z`
  return path
})

const guideIdx = computed(() => props.hoverIdx)

function onHover(event: PointerEvent): void {
  const target = event.currentTarget as SVGRectElement
  const svg = target.ownerSVGElement
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  if (rect.width <= 0) return
  const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1)
  const maxIndex = Math.max(0, (props.series[0]?.points.length ?? 1) - 1)
  emit('hover', Math.round(ratio * maxIndex))
}

function onLeave(): void {
  emit('hover', null)
}
</script>

<template>
  <svg
    :viewBox="`0 0 ${W} ${H}`"
    preserveAspectRatio="none"
    class="w-full overflow-visible"
    :style="{ height: `${height}px` }"
    role="img"
    aria-label="Wykres 24h"
  >
    <path
      v-if="steppedPath"
      :d="steppedPath"
      fill="rgba(122, 46, 58, 0.45)"
      stroke="none"
    />

    <template v-for="(entry, index) in series" :key="entry.id">
      <path
        v-if="entry.fill"
        :d="areaPath(entry.points, index)"
        :fill="entry.color"
        fill-opacity="0.22"
        stroke="none"
      />
      <path
        :d="smoothPath(entry.points, index)"
        fill="none"
        :stroke="entry.color"
        :stroke-width="index === 0 ? 2.6 : 2"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </template>

    <g v-if="guideIdx !== null">
      <line
        :x1="px(guideIdx, series[0]?.points.length ?? 1)"
        :x2="px(guideIdx, series[0]?.points.length ?? 1)"
        y1="0"
        y2="100"
        stroke="rgba(255,255,255,0.28)"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
      <template v-for="(entry, entryIndex) in series" :key="`dot-${entry.id}`">
        <circle
          :cx="px(guideIdx, entry.points.length)"
          :cy="py(entry.points[Math.min(guideIdx, entry.points.length - 1)], entryIndex)"
          r="2.2"
          :fill="entry.color"
          stroke="#2E3440"
          stroke-width="0.8"
        />
      </template>
    </g>

    <rect
      x="0"
      y="0"
      :width="W"
      :height="H"
      fill="transparent"
      @pointermove="onHover"
      @pointerleave="onLeave"
    />
  </svg>
</template>
