<script setup lang="ts">
import { computed, ref } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import SecondaryButtonsRow from '../SecondaryButtonsRow.vue';
import EmbeddedSliderRow from '../EmbeddedSliderRow.vue';
import { useHomeStore } from '../../store';
import { clamp } from '../../utils/format';
import type { SecondaryButton } from '../../types';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const subtitle = computed(() => {
  const e = ent.value;
  if (!e) return null;
  if (!e.on) return 'wyłączono';
  if (e.customSubtitle) return `${e.brightness ?? 0}% • ${e.customSubtitle}`;
  const base = `${e.brightness ?? 0}%`;
  return e.powerWatts ? `${base} • ${e.powerWatts}` : base;
});

const iconClass = computed(() =>
  ent.value?.on ? 'bg-amber-400/35 text-amber-200' : 'bg-white/[0.09] text-white/70 hover:bg-white/[0.15]',
);

const rootEl = ref<HTMLElement | null>(null);
let startX = 0;
let startY = 0;
let startBrightness = 0;
let moved = false;
let dragging = false;

function onPointerDown(e: PointerEvent) {
  dragging = true;
  moved = false;
  startX = e.clientX;
  startY = e.clientY;
  startBrightness = ent.value?.brightness ?? 50;
}

function onPointerMove(e: PointerEvent) {
  if (!dragging) return;
  const horizontal = Math.abs(e.clientX - startX) > 6;
  const vertical = Math.abs(e.clientY - startY) > 6;
  if (!moved && (horizontal || vertical)) moved = true;
  if (!moved) return;
  const rect = rootEl.value?.getBoundingClientRect();
  if (!rect) return;
  const spanLength = Math.max(rect.width, rect.height / 2);
  const delta = horizontal ? e.clientX - startX : e.clientY - startY;
  const value = clamp(Math.round(startBrightness + (delta / Math.max(1, spanLength)) * 100), 1, 100);
  store.patch(props.id, { brightness: value, on: true });
}

function onPointerUp() {
  if (dragging && !moved && !props.nested) store.openModal(props.id);
  dragging = false;
}

function onToggleSecondary(btn: SecondaryButton) {
  if (btn.type === 'ghost_momentary') store.triggerMomentary(props.id, btn.id);
  else store.toggleSecondary(props.id, btn.id);
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
      :icon="ent.icon"
      :track-mode="'slider'"
      :track-active="ent.on"
      :track-pct="ent.brightness ?? 0"
      track-color-class="bg-gradient-to-r from-amber-500/45 to-amber-400/35"
      :span-c="props.spanC"
      :main-buttons="ent.mainButtons ?? []"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="(btn) => store.toggleMainButton(props.id, btn)"
    />

    <EmbeddedSliderRow
      v-if="props.spanR >= 3 && ent.colorTemp !== undefined && ent.expandedContent.secondarySlider"
      label="Temperatura barwowa"
      :value="Math.round(((ent.colorTemp - 2200) / 3800) * 100)"
      :value-text="`${ent.colorTemp} K`"
      color-class="bg-gradient-to-r from-[#F59E0B]/55 to-white/65"
      @change="(v) => store.patch(props.id, { colorTemp: Math.round(2200 + (v / 100) * 3800) })"
    />

    <SecondaryButtonsRow
      v-if="props.spanR >= 2 && ent.expandedContent.secondaryButtons"
      :buttons="ent.secondaryButtons ?? []"
      :columns="props.spanC"
      @toggle="onToggleSecondary"
    />
  </div>
</template>
