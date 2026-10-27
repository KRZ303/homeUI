<script setup lang="ts">
import { ref } from 'vue';
import { clamp } from '../utils/format';

const props = defineProps<{
  label: string;
  value: number;
  valueText?: string;
  colorClass?: string;
}>();

const emit = defineEmits<{ (e: 'change', value: number): void }>();

const rootEl = ref<HTMLElement | null>(null);
const dragging = ref(false);
let startValue = 0;
let startX = 0;

function onPointerDown(e: PointerEvent) {
  dragging.value = true;
  startValue = props.value;
  startX = e.clientX;
  rootEl.value?.setPointerCapture(e.pointerId);
  rootEl.value?.focus();
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return;
  const rect = rootEl.value?.getBoundingClientRect();
  if (!rect) return;
  const pct = clamp(Math.round(startValue + ((e.clientX - startX) / rect.width) * 100), 0, 100);
  emit('change', pct);
}

function onPointerUp(e: PointerEvent) {
  dragging.value = false;
  rootEl.value?.releasePointerCapture(e.pointerId);
}
</script>

<template>
  <div
    ref="rootEl"
    tabindex="0"
    role="slider"
    :aria-valuenow="value"
    :aria-label="label"
    class="h-9 rounded-full bg-black/35 p-1 cursor-ew-resize flex items-center outline-none focus-visible:ring-1 focus-visible:ring-[#73B7B2]/60"
    @pointerdown.stop.prevent="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup.stop="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div class="w-full h-full rounded-full overflow-hidden relative bg-black/25">
      <div
        class="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
        :class="colorClass ?? 'bg-[#73B7B2]/55'"
        :style="{ width: `${value}%` }"
      />
      <div class="absolute inset-0 flex items-center justify-between px-3 text-[11px] font-semibold text-white/85 pointer-events-none">
        <span class="truncate">{{ label }}</span>
        <span class="tabular-nums text-white/75">{{ valueText ?? `${value}%` }}</span>
      </div>
    </div>
  </div>
</template>
