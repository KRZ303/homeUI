<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Entity, MainButton, SensorSeries } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import SensorChart from '../SensorChart.vue'
import { effectiveSpan } from '../../utils/tile'
import { toPL } from '../../utils/format'
import { toggleIcon, toggleMainButton } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))
const analytical = computed(() => span.value.c >= 3 && span.value.r >= 3)
const graphVisible = computed(() => span.value.c >= 2 && span.value.r >= 2)
const hoverIdx = ref<number | null>(null)

const series = computed(() => entity.series ?? [])
const primary = computed(() => series.value[0])
const secondary = computed(() => series.value[1])
const rightMax = computed(() => entity.rightAxisMax ?? secondary.value?.max ?? '')
const rightMin = computed(() => entity.rightAxisMin ?? secondary.value?.min ?? '')
const mixedUnits = computed(() => new Set(series.value.map((entry) => entry.unit)).size > 1)

const graphHeight = computed(() => (analytical.value ? 100 : 54))

function formatPoint(value: number): string {
  return Number.isInteger(value) ? toPL(value) : toPL(value, 2)
}

function displayFor(entry: SensorSeries): string {
  if (hoverIdx.value === null) return entry.current
  const value = entry.points[Math.min(hoverIdx.value, entry.points.length - 1)]
  return formatPoint(value)
}

const primaryDisplay = computed(() => (primary.value ? displayFor(primary.value) : ''))
const secondaryDisplay = computed(() => (secondary.value ? displayFor(secondary.value) : ''))

function onMain(button: MainButton): void {
  toggleMainButton(entity, button)
}
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none" surface-class="bg-[#2E3440]">
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="'bg-[#3B4454] text-[#60A5FA]'"
      track-mode="none"
      @icon="toggleIcon(entity)"
      @main="onMain"
    />

    <div v-if="graphVisible" class="relative mt-1 flex min-h-0 flex-1 flex-col">
      <div class="flex items-start justify-between gap-2 px-1">
        <div class="flex min-w-0 items-baseline gap-1">
          <span class="text-2xl font-light tracking-tight text-white tabular-nums sm:text-[26px]">
            {{ primaryDisplay }}
          </span>
          <span class="text-xs font-medium text-white/65">{{ primary?.unit }}</span>
        </div>

        <div
          v-if="series.length > 2"
          class="flex flex-col items-end gap-0.5 text-[11px] text-white/85 tabular-nums"
        >
          <span v-for="entry in series.slice(1)" :key="entry.id">
            {{ displayFor(entry) }} {{ entry.unit }}
          </span>
        </div>
        <div v-else-if="secondary" class="flex shrink-0 items-baseline gap-1">
          <span class="text-2xl font-light tracking-tight text-white tabular-nums sm:text-[26px]">
            {{ secondaryDisplay }}
          </span>
          <span class="text-xs font-medium text-white/65">{{ secondary.unit }}</span>
        </div>
      </div>

      <div
        v-if="analytical"
        class="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-1 text-[10px] text-white/85"
      >
        <span v-for="entry in series" :key="`legend-${entry.id}`" class="flex items-center gap-1">
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: entry.color }" />
          {{ entry.label }}
        </span>
        <span v-if="entity.steppedAreaPoints?.length" class="flex items-center gap-1">
          <span class="h-2.5 w-2.5 rounded-sm bg-[#6E2E3A]" />
          grzanie %
        </span>
      </div>

      <div
        v-if="analytical && primary"
        class="mt-1 flex items-center justify-between gap-2 px-1 text-[10px] text-white/55 tabular-nums"
      >
        <span>Min: {{ primary.min }} {{ primary.unit }} ({{ primary.minTime }})</span>
        <span>Max: {{ primary.max }} {{ primary.unit }} ({{ primary.maxTime }})</span>
      </div>

      <div class="relative -mx-3 -mb-3 mt-auto">
        <SensorChart
          :series="series"
          :stepped-area-points="entity.steppedAreaPoints"
          :right-min="Number(rightMin) || 0"
          :right-max="Number(rightMax) || 110"
          :hover-idx="hoverIdx"
          :height="graphHeight"
          :separate-axes="mixedUnits"
          @hover="hoverIdx = $event"
        />

        <span
          v-if="primary"
          class="pointer-events-none absolute left-2 top-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white/85 tabular-nums"
        >
          {{ primary.max }}
        </span>
        <span
          v-if="primary"
          class="pointer-events-none absolute bottom-1 left-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white/85 tabular-nums"
        >
          {{ primary.min }}
        </span>
        <span
          v-if="rightMax"
          class="pointer-events-none absolute right-2 top-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white/85 tabular-nums"
        >
          {{ rightMax }}
        </span>
        <span
          v-if="rightMin"
          class="pointer-events-none absolute bottom-1 right-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-white/85 tabular-nums"
        >
          {{ rightMin }}
        </span>

        <div
          v-if="analytical"
          class="pointer-events-none absolute inset-x-14 bottom-0.5 flex items-center justify-between text-[9px] text-white/40"
        >
          <span>-24h</span>
          <span>-12h</span>
          <span>-6h</span>
          <span>Teraz</span>
        </div>
      </div>
    </div>
  </TileFrame>
</template>
