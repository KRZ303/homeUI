<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import AppIcon from './icons/AppIcon.vue';
import { ChevronDown, Check, MoreHorizontal } from 'lucide-vue-next';
import type { MainButton } from '../types';

const props = defineProps<{
  title: string;
  subtitle: string | null;
  iconClass: string;
  iconType?: 'lucide' | 'mdi';
  icon?: string;
  iconSizeClass?: string;
  trackMode?: 'none' | 'slider' | 'progress';
  trackActive?: boolean;
  trackPct?: number;
  trackColorClass?: string;
  spanC?: number;
  mainButtons?: MainButton[];
}>();

const emit = defineEmits<{ (e: 'icon-click', ev: MouseEvent): void; (e: 'main-click', btn: MainButton): void }>();

const spanC = computed(() => props.spanC ?? 2);
const mainButtons = computed(() => (props.mainButtons ?? []).slice(0, 4));
const maxInlineForSpan = computed(() => {
  const c = spanC.value;
  if (c >= 4) return 4;
  if (c === 3) return 2;
  if (c === 2) return 1;
  return 0;
});

const collapseToDropdown = computed(() => mainButtons.value.length > maxInlineForSpan.value);
const inlineButtons = computed(() => mainButtons.value.slice(0, maxInlineForSpan.value));

const dropdownOpen = ref(false);

const titleClass = computed(() => (spanC.value === 1 ? 'text-[13px]' : 'text-[15px]'));

const hasSliderUnderneath = computed(() => (props.trackMode ?? 'none') !== 'none');

function mainButtonClass(btn: MainButton): string {
  if (btn.customActiveClass && btn.active) return btn.customActiveClass;
  if (hasSliderUnderneath.value) {
    return btn.active
      ? 'bg-[#73B7B2]/30 text-teal-50 border border-[#73B7B2]/45 backdrop-blur-[2px] hover:bg-[#73B7B2]/40'
      : 'bg-black/25 text-white/90 border border-white/10 backdrop-blur-[2px] hover:bg-black/40';
  }
  return btn.active
    ? btn.customActiveClass ?? 'bg-[#73B7B2] text-[#182C2A]'
    : 'bg-white/[0.08] text-white/85 hover:bg-white/[0.16]';
}

const fillStyle = computed(() => {
  if (!hasSliderUnderneath.value || !props.trackActive) return { width: '0px' };
  const pct = Math.max(0, Math.min(100, props.trackPct ?? 0));
  return { width: `calc(52px + (100% - 52px) * ${pct / 100})` };
});

const thumbVisible = computed(() => props.trackMode === 'slider' && Boolean(props.trackActive));

const rowEl = ref<HTMLElement | null>(null);
const trackEl = ref<HTMLElement | null>(null);

defineExpose({ rowEl, trackEl });

function onDocPointerDown(ev: PointerEvent) {
  if (!dropdownOpen.value) return;
  if (rowEl.value && ev.target instanceof Node && rowEl.value.contains(ev.target)) return;
  dropdownOpen.value = false;
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
}

onMounted(() => document.addEventListener('pointerdown', onDocPointerDown, true));
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocPointerDown, true));
</script>

<script lang="ts">
export default {
  name: 'TileTopRow',
  inheritAttrs: false,
};
</script>

<template>
  <div ref="rowEl" class="relative w-full h-11 shrink-0 flex items-center justify-between select-none">
    <div
      v-if="hasSliderUnderneath"
      ref="trackEl"
      data-slot="track"
      class="absolute -inset-1 rounded-full overflow-hidden pointer-events-none transition-colors"
      :class="trackActive ? 'bg-black/30' : ''"
    >
      <div
        class="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
        :class="trackColorClass"
        :style="fillStyle"
      >
        <div
          v-if="thumbVisible"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-white/45"
        ></div>
      </div>
    </div>

    <div class="relative flex items-center gap-3 min-w-0 shrink-0">
      <button
        class="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90"
        :class="iconClass"
        aria-label="Akcja główna urządzenia"
        @pointerdown.stop
        @click.stop="emit('icon-click', $event)"
      >
        <AppIcon :icon-type="iconType ?? 'lucide'" :icon="icon" :icon-class="iconSizeClass ?? 'w-5 h-5'" />
      </button>
      <div class="min-w-0">
        <div :class="titleClass" class="font-bold text-white leading-tight truncate">
          {{ title }}
        </div>
        <div v-if="subtitle" class="text-[11px] text-white/80 leading-tight mt-0.5 truncate tabular-nums">
          {{ subtitle }}
        </div>
      </div>
    </div>

    <div v-if="mainButtons.length > 0 && !collapseToDropdown" class="relative flex items-center gap-1.5 shrink-0">
      <button
        v-for="btn in inlineButtons"
        :key="btn.id"
        class="h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap transition-colors"
        :class="mainButtonClass(btn)"
        @pointerdown.stop
        @click.stop="emit('main-click', btn)"
      >
        <AppIcon
          :icon-type="btn.iconType ?? 'lucide'"
          :icon="btn.icon"
          icon-class="w-3.5 h-3.5 shrink-0"
        />
        <span v-if="btn.showLabel" class="truncate max-w-[8rem]">{{ btn.label }}</span>
      </button>
    </div>

    <div
      v-else-if="mainButtons.length > 0"
      class="relative shrink-0"
      data-dropdown-root
    >
      <button
        class="h-9 px-1.5 flex items-center gap-1 text-xs font-semibold bg-transparent border-0 shadow-none transition-colors text-white/85 hover:text-white"
        @pointerdown.stop
        @click.stop="toggleDropdown"
      >
        <AppIcon
          :icon-type="mainButtons[0]?.iconType ?? 'lucide'"
          :icon="mainButtons[0]?.icon"
          icon-class="w-3.5 h-3.5 shrink-0"
        />
        <MoreHorizontal class="w-3.5 h-3.5 shrink-0" />
        <span class="text-[11px] tabular-nums text-white/60">{{ mainButtons.length }}</span>
        <ChevronDown class="w-3.5 h-3.5" :style="dropdownOpen ? 'transform: rotate(180deg)' : ''" />
      </button>
      <div
        v-if="dropdownOpen"
        class="absolute right-0 top-11 z-50 flex flex-col items-end gap-1.5 bg-transparent border-0 p-0 shadow-none"
      >
        <button
          v-for="btn in mainButtons"
          :key="btn.id"
          class="h-9 px-3.5 rounded-full flex items-center gap-2 text-xs font-semibold whitespace-nowrap shadow-lg backdrop-blur-md transition-all"
          :class="mainButtonClass(btn)"
          @pointerdown.stop
          @click.stop="emit('main-click', btn); dropdownOpen = false"
        >
          <AppIcon :icon-type="btn.iconType ?? 'lucide'" :icon="btn.icon" icon-class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate max-w-[13rem]">{{ btn.label }}</span>
          <Check v-if="btn.active" class="w-3.5 h-3.5 shrink-0 ml-0.5" />
        </button>
      </div>
    </div>
  </div>
</template>
