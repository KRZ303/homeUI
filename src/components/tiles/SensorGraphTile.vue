<script setup lang="ts">
import { computed, ref } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import { useHomeStore } from '../../store';
import { clamp, fmtTemp } from '../../utils/format';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);
const spanC = computed(() => props.spanC ?? 1);
const spanR = computed(() => props.spanR ?? 1);

const series = computed(() => ent.value?.series ?? []);
const graphVisible = computed(() => spanC.value >= 2 && spanR.value >= 2);
const analytical = computed(() => spanC.value >= 3 && spanR.value >= 3);

const iconClass = 'bg-[#3B4454] text-[#60A5FA]';

const subtitle = computed(() => {
  const s = series.value;
  if (!graphVisible.value) {
    const base = `${s[0]?.current ?? ''} ${s[0]?.unit ?? ''}`.trim();
    const extra = spanC.value >= 2 && s[1] ? ` • ${s[1].current} ${s[1].unit}` : '';
    return `${base}${extra}`.trim() || '—';
  }
  return 'Ostatnie 24h';
});

const hoverIdx = ref<number | null>(null);

function displayValue(sIdx: number): string {
  const s = series.value[sIdx];
  if (!s) return '';
  const idx = hoverIdx.value ?? s.points.length - 1;
  const raw = s.points[clamp(idx, 0, s.points.length - 1)];
  return typeof raw === 'number' ? raw.toFixed(2).replace('.', ',') : (s.current ?? '');
}

function buildSmoothPath(points: number[], minVal: number, maxVal: number): string {
  if (points.length < 2) return '';
  const px = (i: number) => (i / (points.length - 1)) * 300;
  const py = (v: number) => 100 - ((v - minVal) / Math.max(0.0001, maxVal - minVal)) * 100;
  let d = `M ${px(0).toFixed(2)} ${py(points[0]).toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cx = (px(i) + px(i + 1)) / 2;
    d += ` C ${cx.toFixed(2)} ${py(points[i]).toFixed(2)}, ${cx.toFixed(2)} ${py(points[i + 1]).toFixed(2)}, ${px(i + 1).toFixed(2)} ${py(points[i + 1]).toFixed(2)}`;
  }
  return d;
}

function buildAreaPath(points: number[], minVal: number, maxVal: number): string {
  const line = buildSmoothPath(points, minVal, maxVal);
  if (!line) return '';
  return `${line} L 300 100 L 0 100 Z`;
}

function buildSteppedArea(points: number[], maxVal: number): string {
  if (points.length < 2) return '';
  const stepW = 300 / points.length;
  let d = 'M 0 100';
  points.forEach((v, i) => {
    const y = 100 - (v / Math.max(0.0001, maxVal)) * 100;
    const x1 = i * stepW;
    const x2 = (i + 1) * stepW;
    d += ` L ${x1.toFixed(2)} ${y.toFixed(2)} L ${x2.toFixed(2)} ${y.toFixed(2)}`;
  });
  d += ' L 300 100 Z';
  return d;
}

function graphBounds() {
  const all = series.value.flatMap((s) => s.points);
  const stepped = ent.value?.steppedAreaPoints ?? [];
  return {
    minVal: Math.min(...all, ...stepped),
    maxVal: Math.max(...all, ...stepped),
    steppedMax: Math.max(...stepped, 1),
  };
}

const chartHeight = computed(() => (analytical.value ? 112 : 68));

function onChartMove(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const frac = clamp((e.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
  hoverIdx.value = Math.round(frac * Math.max(0, series.value[0]?.points.length ?? 12 - 1));
}

const leftAxisMax = computed(() => {
  const s = series.value[0];
  return graphVisible.value && s?.max ? s.max : undefined;
});
const leftAxisMin = computed(() => {
  const s = series.value[0];
  return graphVisible.value && s?.min ? s.min : undefined;
});
</script>

<template>
  <div
    v-if="ent"
    class="flex flex-col h-full relative"
    @pointerup.stop="store.openModal(props.id)"
  >
    <TileTopRow
      :title="ent.title"
      :subtitle="subtitle"
      :icon-class="iconClass"
      :icon-type="ent.iconType ?? 'lucide'"
      :icon="ent.icon"
      :track-mode="'none'"
      :span-c="spanC"
      :main-buttons="ent.mainButtons ?? []"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="(btn) => store.toggleMainButton(props.id, btn)"
    />

    <div v-if="graphVisible" class="relative flex-1 min-h-0 flex flex-col">
      <!-- Big readouts -->
      <div class="flex items-start justify-between pt-1.5 px-1">
        <div class="flex items-baseline gap-1">
          <span class="text-2xl sm:text-[26px] font-light tracking-tight text-white tabular-nums">
            {{ displayValue(0) }}
          </span>
          <span class="text-xs font-medium text-white/65">{{ series[0]?.unit }}</span>
        </div>
        <div class="flex flex-col items-end text-right">
          <template v-if="series.length === 2">
            <span class="text-2xl sm:text-[26px] font-light tracking-tight text-white tabular-nums">
              {{ displayValue(1) }}
            </span>
            <span class="text-xs font-medium text-white/65">{{ series[1]?.unit }}</span>
          </template>
          <template v-else-if="series.length > 2">
            <div
              v-for="(s, i) in series.slice(1)"
              :key="s.id"
              class="text-xs text-white/85 tabular-nums"
              :style="{ color: hoverIdx !== null ? undefined : undefined }"
            >
              {{ s.label }}: <span class="text-white">{{ displayValue(i + 1) }} {{ s.unit }}</span>
            </div>
          </template>
        </div>
      </div>

      <!-- 3x3 analytical header -->
      <div v-if="analytical" class="pt-1.5">
        <div class="flex items-center justify-center gap-3 text-[10px] font-semibold text-white/80">
          <span v-for="s in series" :key="`lg${s.id}`" class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ background: s.color }"></span>
            {{ s.label }}
          </span>
          <span v-if="ent.steppedAreaPoints" class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-sm bg-[#6E2E3A]"></span>
            grzanie %
          </span>
        </div>
        <div class="flex items-center justify-between pt-1 text-[10px] text-white/70 tabular-nums px-1">
          <span>Min: {{ series[0]?.min }} {{ series[0]?.unit }} ({{ series[0]?.minTime }})</span>
          <span>Max: {{ series[0]?.max }} {{ series[0]?.unit }} ({{ series[0]?.maxTime }})</span>
        </div>
      </div>

      <!-- 24h SVG chart canvas -->
      <div
        class="-mx-3 -mb-3 mt-auto relative"
        @mousemove="onChartMove"
        @mouseleave="hoverIdx = null"
      >
        <svg
          :viewBox="`0 0 300 100`"
          preserveAspectRatio="none"
          class="block w-[calc(100%+24px)]"
          :style="{ height: `${chartHeight}px` }"
        >
          <path
            v-if="ent.steppedAreaPoints"
            :d="buildSteppedArea(ent.steppedAreaPoints, graphBounds().steppedMax)"
            fill="rgba(122, 46, 58, 0.45)"
          />
          <g v-for="(s, i) in series" :key="`c${s.id}`">
            <path
              v-if="s.fill"
              :d="buildAreaPath(s.points, graphBounds().minVal, graphBounds().maxVal)"
              :fill="s.color"
              fill-opacity="0.22"
            />
            <path
              :d="buildSmoothPath(s.points, graphBounds().minVal, graphBounds().maxVal)"
              fill="none"
              :stroke="s.color"
              :stroke-width="i === 0 ? '2.6' : '2.0'"
              stroke-linecap="round"
            />
          </g>
        </svg>

        <span
          v-if="leftAxisMax"
          class="absolute top-0 left-0 px-2 py-0.5 rounded-full bg-black/45 text-[10px] font-semibold text-white/85 tabular-nums"
        >
          {{ leftAxisMax }}
        </span>
        <span
          v-if="leftAxisMin"
          class="absolute bottom-0 left-0 px-2 py-0.5 rounded-full bg-black/45 text-[10px] font-semibold text-white/85 tabular-nums"
        >
          {{ leftAxisMin }}
        </span>
        <span
          v-if="ent.rightAxisMax"
          class="absolute top-0 right-0 px-2 py-0.5 rounded-full bg-black/45 text-[10px] font-semibold text-white/85 tabular-nums"
        >
          {{ ent.rightAxisMax }}
        </span>
        <span
          v-if="ent.rightAxisMin"
          class="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-black/45 text-[10px] font-semibold text-white/85 tabular-nums"
        >
          {{ ent.rightAxisMin }}
        </span>

        <div v-if="analytical" class="absolute bottom-14 left-0 right-0 flex items-center justify-around text-[10px] text-white/50 tabular-nums pointer-events-none">
          <span>-24h</span><span>-12h</span><span>-6h</span><span>Teraz</span>
        </div>
      </div>
    </div>
    <div v-else class="grid place-items-center flex-1 pointer-events-none">
      <span class="text-[10px] text-white/35">tapnij ✢ ikonę aby rozwinąć wykres</span>
    </div>
  </div>
</template>

<script lang="ts">
export default { name: 'SensorGraphTile' };
</script>
