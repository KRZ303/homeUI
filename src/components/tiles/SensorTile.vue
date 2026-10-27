<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Entity } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import SensorChart from '../SensorChart.vue'
import { effectiveSpan } from '../../utils/tile'
import { toggleIcon, toggleMainButton } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))
const analytical = computed(() => span.value.c >= 3 && span.value.r >= 3)
const graphVisible = computed(() => span.value.c >= 2 && span.value.r >= 2)

const hoverIdx = ref<number | null>(null)

const series = computed(() => entity.series ?? [])

function formatPoint(value: number): string {
  return value.toFixed(2).replace('.', ',').replace(/,00$/, '')
}

function displayValue(index: number): string {
  const s = series.value[index]
  if (!s) return ''
  if (hoverIdx.value !== null) {
    const point = s.points[Math.min(hoverIdx.value, s.points.length - 1)] ?? 0
    return formatPoint(point)
  }
  return s.current
}

const chartHeight = computed(() => (analytical.value ? 112 : 68))
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none">
    <TileTopRow
      :entity="entity"
      :on-button="(button) => toggleMainButton(entity, button.id)"
      @icon="toggleIcon(entity)"
    />

    <template v-if="graphVisible && series.length">
      <!-- Big primary / secondary readouts -->
      <div class="mt-2 flex items-end justify-between gap-3">
        <div class="min-w-0">
          <span class="text-2xl font-light tracking-tight tabular-nums text-white sm:text-[26px]">
            {{ displayValue(0) }}
          </span>
          <span class="ml-1.5 text-xs font-medium text-white/65">{{ series[0].unit }}</span>
        </div>
        <div v-if="series.length === 2" class="shrink-0 text-right">
          <span class="text-2xl font-light tracking-tight tabular-nums text-white sm:text-[26px]">
            {{ displayValue(1) }}
          </span>
          <span class="ml-1.5 text-xs font-medium text-white/65">{{ series[1].unit }}</span>
        </div>
        <div v-else-if="series.length > 2" class="flex shrink-0 flex-col items-end gap-0.5">
          <div
            v-for="(s, index) in series.slice(1)"
            :key="s.id"
            class="text-xs tabular-nums text-white/85"
          >
            {{ displayValue(index + 1) }} {{ s.unit }}
          </div>
        </div>
      </div>

      <!-- 3×3 analytical header: legend + min/max extremes -->
      <template v-if="analytical">
        <div class="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span
            v-for="s in series"
            :key="s.id"
            class="flex items-center gap-1.5 text-[10px] font-medium text-white/75"
          >
            <span class="h-2.5 w-2.5 rounded-full" :style="{ background: s.color }"></span>
            {{ s.label }}
          </span>
          <span
            v-if="entity.steppedAreaPoints"
            class="flex items-center gap-1.5 text-[10px] font-medium text-white/75"
          >
            <span class="h-2.5 w-2.5 rounded-sm bg-[#6E2E3A]"></span>
            grzanie %
          </span>
        </div>
        <div class="mt-1.5 flex items-center justify-between text-[10px] tabular-nums text-white/60">
          <span class="truncate">
            Min: {{ series[0].min }} {{ series[0].unit }} ({{ series[0].minTime }})
          </span>
          <span class="truncate">
            Max: {{ series[0].max }} {{ series[0].unit }} ({{ series[0].maxTime }})
          </span>
        </div>
      </template>

      <SensorChart
        :entity="entity"
        :height="chartHeight"
        @hover="hoverIdx = $event"
      />
    </template>
  </TileFrame>
</template>
