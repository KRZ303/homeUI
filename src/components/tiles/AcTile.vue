<script setup lang="ts">
import { computed, ref } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import EmbeddedSliderRow from '../EmbeddedSliderRow.vue';
import { useHomeStore } from '../../store';
import { clamp, fmtTemp } from '../../utils/format';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const iconClass = computed(() =>
  ent.value?.on ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.09] text-white/70 hover:bg-white/[0.16]',
);

const subtitle = computed(
  () => `${fmtTemp(ent.value?.measuredTemp)} °C → Cel ${fmtTemp(ent.value?.targetTemp)} °C`,
);

const buttons = computed(() => {
  const e = ent.value;
  if (!e) return [];
  return [
    { id: 'swing', label: 'Swing', icon: 'ac-swing', iconType: 'mdi' as const, active: e.swing ?? false, showLabel: false },
    { id: 'fan', label: 'Wentylator', icon: 'Fan', iconType: 'lucide' as const, active: e.fan ?? false, showLabel: true },
    { id: 'ionizer', label: 'Jonizacja', icon: 'ionizer', iconType: 'mdi' as const, active: e.ionizer ?? false, showLabel: true },
    {
      id: 'target',
      label: `${fmtTemp((e.targetTemp ?? 22) + (e.targetTemp !== undefined && Number.isInteger(e.targetTemp) ? 0 : 0))}°C`,
      icon: 'Thermometer',
      iconType: 'lucide' as const,
      active: e.on ?? false,
      showLabel: true,
      customActiveClass: 'bg-[#73B7B2]/35 text-white border border-[#73B7B2]/40',
    },
  ];
});

const rootEl = ref<HTMLElement | null>(null);
let startX = 0;
let startPct = 0;
let moved = false;
let dragging = false;

function onPointerDown(e: PointerEvent) {
  dragging = true;
  moved = false;
  startX = e.clientX;
  startPct = ent.value?.fanSpeedPct ?? 40;
}
function onPointerMove(e: PointerEvent) {
  if (!dragging) return;
  if (!moved && Math.abs(e.clientX - startX) > 6) moved = true;
  if (!moved) return;
  const rect = rootEl.value?.getBoundingClientRect();
  if (!rect) return;
  const value = clamp(Math.round(startPct + ((e.clientX - startX) / Math.max(1, rect.width)) * 100), 0, 100);
  store.patch(props.id, { on: true, fanSpeedPct: value });
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
      :icon="ent.icon ?? 'Snowflake'"
      track-mode="slider"
      :track-active="ent.on"
      :track-pct="ent.fanSpeedPct ?? 0"
      track-color-class="bg-gradient-to-r from-[#2D6880]/65 to-[#73B7B2]/45"
      :span-c="props.spanC"
      :main-buttons="buttons"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="(btn) => store.toggleMainButton(props.id, btn)"
    />

    <EmbeddedSliderRow
      v-if="props.spanR >= 2 && ent.expandedContent.secondarySlider"
      label="Prędkość turbiny nawiewu"
      :value="ent.fanSpeedPct ?? 0"
      color-class="bg-gradient-to-r from-[#2D6880]/65 to-[#73B7B2]/45"
      @change="(v) => store.patch(props.id, { on: true, fanSpeedPct: v })"
    />
  </div>
</template>
