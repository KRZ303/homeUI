<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Device, GraphSeries } from '../types'

const props = defineProps<{ device: Device }>()
const hoverIdx = ref<number | null>(null)
const analytical = computed(() => props.device.span.c >= 3 && props.device.span.r >= 3)
const visible = computed(() => props.device.span.c >= 2 && props.device.span.r >= 2)
const series = computed(() => props.device.series || [])

function pointValue(item: GraphSeries) {
  return hoverIdx.value === null ? item.current : String(item.points[hoverIdx.value]).replace('.', ',')
}
function coordinates(item: GraphSeries) {
  const low = Math.min(...item.points)
  const high = Math.max(...item.points)
  return item.points.map((value, index) => ({
    x: index * (300 / (item.points.length - 1)),
    y: 92 - ((value - low) / Math.max(0.001, high - low)) * 78,
  }))
}
function smoothPath(item: GraphSeries) {
  const points = coordinates(item)
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index]
    const middle = (previous.x + point.x) / 2
    return `${path} C ${middle} ${previous.y}, ${middle} ${point.y}, ${point.x} ${point.y}`
  }, `M ${points[0].x} ${points[0].y}`)
}
function areaPath(item: GraphSeries) {
  return `${smoothPath(item)} L 300 100 L 0 100 Z`
}
function heatingPath() {
  const points = props.device.steppedAreaPoints || []
  if (!points.length) return ''
  let path = 'M 0 100 L 0 92'
  points.forEach((value, index) => {
    const x = index * (300 / (points.length - 1))
    const y = 96 - value * 0.8
    path += ` L ${x} ${y}`
    if (index < points.length - 1) path += ` L ${x + 300 / (points.length - 1)} ${y}`
  })
  return `${path} L 300 100 Z`
}
function scrub(event: PointerEvent) {
  const rect = (event.currentTarget as SVGElement).getBoundingClientRect()
  hoverIdx.value = Math.max(0, Math.min(11, Math.round(((event.clientX - rect.left) / rect.width) * 11)))
}
</script>

<template>
  <div v-if="visible" class="sensor-content">
    <div class="sensor-readouts">
      <div class="primary-reading"><strong>{{ pointValue(series[0]) }}</strong><span>{{ series[0].unit }}</span></div>
      <div v-if="series.length === 2" class="secondary-reading"><strong>{{ pointValue(series[1]) }}</strong><span>{{ series[1].unit }}</span></div>
      <div v-else-if="series.length > 2" class="stacked-readings">
        <span v-for="item in series.slice(1)" :key="item.id" :style="{ color: item.color }">{{ pointValue(item) }} {{ item.unit }}</span>
      </div>
    </div>
    <div v-if="analytical" class="graph-legend">
      <span v-for="item in series" :key="item.id"><i :style="{ background: item.color }" />{{ item.label }}</span>
      <span v-if="device.steppedAreaPoints"><i class="heat-dot" />grzanie %</span>
    </div>
    <div v-if="analytical" class="graph-extremes">
      <span>Min: {{ series[0].min }} {{ series[0].unit }} ({{ series[0].minTime }})</span>
      <span>Max: {{ series[0].max }} {{ series[0].unit }} ({{ series[0].maxTime }})</span>
    </div>
    <div class="graph-wrap" :class="{ analytical }">
      <span class="axis-badge top-left">{{ series[0].max }}</span>
      <span class="axis-badge bottom-left">{{ series[0].min }}</span>
      <span v-if="analytical" class="axis-badge top-right">{{ device.rightAxisMax || series.at(-1)?.max }}</span>
      <span v-if="analytical" class="axis-badge bottom-right">{{ device.rightAxisMin || series.at(-1)?.min }}</span>
      <svg viewBox="0 0 300 100" preserveAspectRatio="none" role="img" :aria-label="`${device.title}: wykres z ostatnich 24 godzin`" @pointermove="scrub" @pointerleave="hoverIdx = null">
        <path v-if="device.steppedAreaPoints" :d="heatingPath()" fill="rgba(122,46,58,.45)" />
        <template v-for="item in series" :key="item.id">
          <path v-if="item.fill" :d="areaPath(item)" :fill="item.color" fill-opacity=".14" />
          <path :d="smoothPath(item)" fill="none" :stroke="item.color" :stroke-width="analytical ? 2 : 2.6" vector-effect="non-scaling-stroke" stroke-linecap="round" />
        </template>
        <line v-if="hoverIdx !== null" :x1="hoverIdx * 300 / 11" :x2="hoverIdx * 300 / 11" y1="5" y2="100" stroke="rgba(255,255,255,.35)" stroke-dasharray="3 3" vector-effect="non-scaling-stroke" />
      </svg>
      <div v-if="analytical" class="graph-times"><span>-24h</span><span>-12h</span><span>-6h</span><span>Teraz</span></div>
    </div>
  </div>
</template>
