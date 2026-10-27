<script setup lang="ts">
import { computed, ref } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import EmbeddedSliderRow from '../EmbeddedSliderRow.vue';
import { useHomeStore } from '../../store';
import { clamp } from '../../utils/format';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const iconClass = computed(() =>
  ent.value?.on ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.09] text-white/65 hover:bg-white/[0.16]',
);

const subtitle = computed(() => (ent.value?.on ? `${ent.value.source} • Głośność ${ent.value.volume}%` : 'wyłączono'));

const buttons = computed(() => {
  const e = ent.value;
  if (!e) return [];
  return [
    { id: 'source', label: (e.source ?? 'Netflix').split(' •')[0], icon: 'Tv', iconType: 'lucide' as const, active: e.on ?? false, showLabel: true },
    { id: 'pause', label: e.playing ? 'Pauza' : 'Odtwarzaj', icon: e.playing ? 'Pause' : 'Play', iconType: 'lucide' as const, active: Boolean(e.playing), showLabel: false },
    { id: 'power', label: 'Zasilanie', icon: 'Power', iconType: 'lucide' as const, active: e.on ?? false, showLabel: false, customActiveClass: 'bg-rose-500/35 text-rose-100' },
  ];
});

const rootEl = ref<HTMLElement | null>(null);
let startX = 0;
let startVal = 0;
let moved = false;
let dragging = false;

function onPointerDown(e: PointerEvent) {
  dragging = true;
  moved = false;
  startX = e.clientX;
  startVal = ent.value?.volume ?? 30;
}
function onPointerMove(e: PointerEvent) {
  if (!dragging) return;
  if (!moved && Math.abs(e.clientX - startX) > 6) moved = true;
  if (!moved) return;
  const rect = rootEl.value?.getBoundingClientRect();
  if (!rect) return;
  const value = clamp(Math.round(startVal + ((e.clientX - startX) / Math.max(1, rect.width)) * 100), 0, 100);
  store.patch(props.id, { on: true, volume: value });
}
function onPointerUp() {
  if (dragging && !moved && !props.nested) store.openModal(props.id);
  dragging = false;
}
</script>

<template>
  <div
    v-if="ent"
    ref="rootEl"
    class="flex flex-col h-full"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup.stop="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <TileTopRow
      :title="ent.title"
      :subtitle="subtitle"
      :icon-class="iconClass"
      :icon-type="ent.iconType ?? 'lucide'"
      :icon="ent.icon ?? 'Tv'"
      track-mode="slider"
      :track-active="ent.on"
      :track-pct="ent.volume ?? 0"
      track-color-class="bg-gradient-to-r from-indigo-500/45 to-[#73B7B2]/45"
      :span-c="props.spanC"
      :main-buttons="buttons"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="(btn) => store.toggleMainButton(props.id, btn)"
    />

    <EmbeddedSliderRow
      v-if="props.spanR >= 2 && ent.expandedContent.secondarySlider"
      label="Głośność amplitunera"
      :value="ent.volume ?? 0"
      color-class="bg-gradient-to-r from-indigo-500/45 to-[#73B7B2]/45"
      @change="(v) => store.patch(props.id, { on: true, volume: v })"
    />
  </div>
</template>
