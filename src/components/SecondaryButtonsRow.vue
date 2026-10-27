<script setup lang="ts">
import { computed, ref } from 'vue';
import AppIcon from './icons/AppIcon.vue';
import type { SecondaryButton } from '../types';

const props = defineProps<{
  buttons: SecondaryButton[];
  columns: number;
  vertical?: boolean;
}>();

const emit = defineEmits<{ (e: 'toggle', btn: SecondaryButton): void }>();

const gridColumnClass = computed(() => {
  if (props.vertical) return '';
  return props.buttons.length === 1 ? '' : 'grid grid-cols-2 gap-2.5';
});

function pillClass(btn: SecondaryButton): string {
  if (btn.type === 'ghost_momentary') {
    return btn.active
      ? 'bg-[#73B7B2] text-[#182C2A] shadow-sm'
      : 'bg-white/[0.03] hover:bg-white/[0.08] text-white/90';
  }
  return btn.active
    ? 'bg-[#73B7B2] text-[#182C2A] shadow-sm'
    : 'bg-black/25 hover:bg-black/35 text-white/90';
}

// Sideways expansion morphs non-momentary pills into draggable mini sliders (C >= 4).
const isSliderRow = computed(() => (props.columns >= 4 && !props.vertical ? true : false));
const sliderFillPct = (btn: SecondaryButton) => Math.max(0, Math.min(100, btn.brightness ?? 50));

const rootEl = ref<HTMLElement | null>(null);
const dragBtnId = ref<string | null>(null);
let startPct = 0;
let startX = 0;

function onSliderPointerDown(e: PointerEvent, btn: SecondaryButton) {
  e.stopPropagation();
  dragBtnId.value = btn.id;
  startPct = btn.brightness ?? 50;
  startX = e.clientX;
  rootEl.value?.setPointerCapture(e.pointerId);
}

function onSliderPointerMove(e: PointerEvent) {
  if (!dragBtnId.value) return;
  const rect = rootEl.value?.getBoundingClientRect();
  const btn = props.buttons.find((b) => b.id === dragBtnId.value);
  if (!btn) return;
  const delta = ((e.clientX - startX) / Math.max(1, rect ? rect.width / 2 : 200)) * 100;
  btn.brightness = Math.max(0, Math.min(100, Math.round(startPct + delta)));
}

function onSliderPointerUp() {
  dragBtnId.value = null;
}
</script>

<template>
  <div
    v-if="buttons.length > 0"
    ref="rootEl"
    class="mt-auto pt-2.5"
    @pointermove="onSliderPointerMove"
    @pointerup="onSliderPointerUp"
    @pointercancel="onSliderPointerUp"
  >
    <div v-if="isSliderRow" class="flex flex-col gap-2">
      <div
        v-for="btn in buttons.filter((b) => b.type === 'oval_pill')"
        :key="btn.id"
        class="relative h-[44px] rounded-full bg-black/35 p-1 cursor-ew-resize overflow-hidden"
        @pointerdown="(e) => onSliderPointerDown(e, btn)"
      >
        <div
          class="absolute inset-y-1 left-1 rounded-full transition-all duration-100"
          :style="{ width: `calc(${sliderFillPct(btn)}% - 8px)`, background: 'rgba(115, 183, 178, 0.85)' }"
        />
        <div class="absolute inset-0 flex items-center justify-between px-3 text-[12px] font-semibold text-white/85 pointer-events-none">
          <span class="truncate flex items-center gap-2">
            <AppIcon :icon-type="btn.iconType ?? 'mdi'" :icon="btn.icon ?? 'table-lamp'" icon-class="w-3.5 h-3.5 shrink-0" />
            {{ btn.label }}
          </span>
          <span class="tabular-nums text-white/70">{{ sliderFillPct(btn) }}%</span>
        </div>
      </div>
      <button
        v-for="btn in buttons.filter((b) => b.type === 'ghost_momentary')"
        :key="`g${btn.id}`"
        class="h-[42px] px-4 rounded-full text-[13px] font-semibold gap-2 ml-auto min-w-[148px] transition-colors"
        :class="pillClass(btn)"
        @pointerdown.stop
        @click.stop="emit('toggle', btn)"
      >
        <span class="truncate">{{ btn.label }}</span>
        <AppIcon :icon-type="btn.iconType ?? 'mdi'" :icon="btn.icon ?? 'table-lamp'" icon-class="w-4 h-4 shrink-0" />
      </button>
    </div>

    <div v-else-if="buttons.length === 1" class="flex">
      <button
        class="h-[42px] px-4 rounded-full text-[13px] font-semibold gap-2 ml-auto min-w-[148px] transition-colors flex items-center"
        :class="pillClass(buttons[0])"
        @pointerdown.stop
        @click.stop="emit('toggle', buttons[0])"
      >
        <template v-if="buttons[0].type === 'ghost_momentary'">
          <span class="truncate">{{ buttons[0].label }}</span>
          <AppIcon :icon-type="buttons[0].iconType ?? 'mdi'" :icon="buttons[0].icon ?? 'table-lamp'" icon-class="w-4 h-4 shrink-0" />
        </template>
        <template v-else>
          <AppIcon :icon-type="buttons[0].iconType ?? 'mdi'" :icon="buttons[0].icon ?? 'table-lamp'" icon-class="w-4 h-4 shrink-0" />
          <span class="truncate">{{ buttons[0].label }}</span>
        </template>
      </button>
    </div>

    <div v-else :class="gridColumnClass">
      <button
        v-for="btn in buttons"
        :key="btn.id"
        class="h-[42px] px-4 rounded-full text-[13px] font-semibold gap-2 transition-colors flex items-center justify-center overflow-hidden"
        :class="pillClass(btn)"
        @pointerdown.stop
        @click.stop="emit('toggle', btn)"
      >
        <AppIcon :icon-type="btn.iconType ?? 'mdi'" :icon="btn.icon ?? 'table-lamp'" icon-class="w-4 h-4 shrink-0" />
        <span class="truncate min-w-0 flex-1 text-left">{{ btn.label }}</span>
      </button>
    </div>
  </div>
</template>
