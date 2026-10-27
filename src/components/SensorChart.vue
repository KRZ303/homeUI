<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Entity, Series } from '../types'
import { clamp } from '../utils/format'
import { effectiveSpan } from '../utils/tile'

const props = withDefaults(
  defineProps<{
    entity: Entity
    height: number
  }>(),
  { height: 68 },
)

const emit = defineEmits<{ (event: 'hover', index: number | null): void }>()

const W = 300
const H = 100
const PAD = 6

const series = computed(() => props.entity.series ?? [])
const analytical = computed(() => {
  const span = effectiveSpan(props.entity)
  return span.c >= 3 && span.r >= 3
})

const bounds = computed(() => {
  let min = Infinity
  let max = -Infinity
  for (const s of series.value) {
    for (const p of s.points) {
      if (p < min) min = p
      if (p > max) max = p
    }
  }
  if (!Number.isFinite(min)) {
    min = 0
    max = 1
  }
  if (max - min < 0.001) max = min + 1
  return { min, max }
})

function xAt(i: number): number {
  return PAD + (i * (W - PAD * 2)) / 11
}

function yAt(value: number): number {
  const { min, max } = bounds.value
  return H - PAD - ((value - min) / (max - min)) * (H - PAD * 2)
}

function smoothPath(points: number[]): string {
  let d = `M ${xAt(0).toFixed(2)} ${yAt(points[0]).toFixed(2)}`
  for (let i = 1; i < points.length; i++) {
    const x0 = xAt(i - 1)
    const y0 = yAt(points[i - 1])
    const x1 = xAt(i)
    const y1 = yAt(points[i])
    const cx = (x0 + x1) / 2
    d += ` C ${cx.toFixed(2)} ${y0.toFixed(2)}, ${cx.toFixed(2)} ${y1.toFixed(2)}, ${x1.toFixed(2)} ${y1.toFixed(2)}`
  }
  return d
}

function areaPath(points: number[]): string {
  return `${smoothPath(points)} L ${xAt(points.length - 1).toFixed(2)} ${H - PAD} L ${xAt(0).toFixed(2)} ${H - PAD} Z`
}

const steppedPath = computed(() => {
  const points = props.entity.steppedAreaPoints
  if (!points || !points.length) return ''
  const max = Math.max(...points)
  const step = (W - PAD * 2) / points.length
  let d = `M ${PAD} ${yAt(0)}`
  for (let i = 0; i < points.length; i++) {
    const x0 = PAD + i * step
    const x1 = PAD + (i + 1) * step
    const y = H - PAD - (points[i] / max) * (H - PAD * 2)
    d += ` L ${x0.toFixed(2)} ${y.toFixed(2)} L ${x1.toFixed(2)} ${y.toFixed(2)}`
  }
  d += ` L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`
  return d
})

const leftAxisMax = computed(() => series.value[0]?.max ?? '')
const leftAxisMin = computed(() => series.value[0]?.min ?? '')
const rightAxisMax = computed(() =>
  props.entity.rightAxisMax ?? (series.value.length > 1 ? (series.value[1]?.max ?? '') : ''),
)
const rightAxisMin = computed(() =>
  props.entity.rightAxisMin ?? (series.value.length > 1 ? (series.value[1]?.min ?? '') : ''),
)

const hoverIdx = ref<number | null>(null)

function onPointerMove(event: PointerEvent): void {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const idx = clamp(Math.floor(((event.clientX - rect.left) / rect.width) * 12), 0, 11)
  hoverIdx.value = idx
  emit('hover', idx)
}

function onPointerLeave(): void {
  hoverIdx.value = null
  emit('hover', null)
}

function strokeWidth(s: Series, index: number): number {
  return index === 0 ? 2.6 : 2.0
}

function hoverX(): number {
  return hoverIdx.value === null ? 0 : xAt(hoverIdx.value)
}

function hoverY(s: Series): number {
  const idx = clamp(hoverIdx.value ?? 0, 0, s.points.length - 1)
  return yAt(s.points[idx])
}
</script>

<template>
  <div
    class="relative -mx-3 -mb-3 mt-auto w-[calc(100%+24px)] overflow-hidden"
    :style="{ height: `${height}px` }"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <svg
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="none"
      class="h-full w-full"
      fill="none"
    >
      <!-- Stepped heating background fill (3x3 analytical) -->
      <path v-if="steppedPath" :d="steppedPath" fill="rgba(122, 46, 58, 0.45)" />

      <!-- Area fills -->
      <path
        v-for="s in series.filter((item) => item.fill)"
        :key="`${s.id}-area`"
        :d="areaPath(s.points)"
        :fill="s.color"
        fill-opacity="0.22"
      />

      <!-- Smooth cubic-bezier curves -->
      <path
        v-for="(s, index) in series"
        :key="s.id"
        :d="smoothPath(s.points)"
        :stroke="s.color"
        :stroke-width="strokeWidth(s, index)"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Hover scrub marker -->
      <line
        v-if="hoverIdx !== null"
        :x1="hoverX()"
        :y1="PAD - 3"
        :x2="hoverX()"
        :y2="H - PAD + 3"
        stroke="rgba(255, 255, 255, 0.30)"
        stroke-width="1"
        stroke-dasharray="3 3"
      />
      <template v-if="hoverIdx !== null">
        <circle
          v-for="s in series"
          :key="`${s.id}-dot`"
          :cx="hoverX()"
          :cy="hoverY(s)"
          r="3"
          :fill="s.color"
          stroke="#1C1C1C"
          stroke-width="1.5"
        />
      </template>
    </svg>

    <!-- Corner Y-axis marking pills -->
    <div
      class="absolute left-1.5 top-1.5 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white/85"
    >
      {{ leftAxisMax }}
    </div>
    <div
      class="absolute bottom-1.5 left-1.5 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white/85"
    >
      {{ leftAxisMin }}
    </div>
    <div
      v-if="rightAxisMax"
      class="absolute right-1.5 top-1.5 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white/85"
    >
      {{ rightAxisMax }}
    </div>
    <div
      v-if="rightAxisMin"
      class="absolute bottom-1.5 right-1.5 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white/85"
    >
      {{ rightAxisMin }}
    </div>

    <!-- X-axis timeline labels (3x3 only) -->
    <div
      v-if="analytical"
      class="absolute bottom-2 left-0 right-0 flex justify-between px-4 text-[9px] font-medium text-white/45"
    >
      <span>-24h</span>
      <span>-12h</span>
      <span>-6h</span>
      <span>Teraz</span>
    </div>
  </div>
</template>
