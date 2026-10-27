<script setup lang="ts">
import { computed, ref } from 'vue';
import AppIcon from '../icons/AppIcon.vue';
import TileTopRow from '../TileTopRow.vue';
import EmbeddedSliderRow from '../EmbeddedSliderRow.vue';
import { useHomeStore } from '../../store';
import { clamp } from '../../utils/format';
import { ArrowUp, Pause, ArrowDown } from 'lucide-vue-next';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const position = computed(() => ent.value?.position ?? 0);
const tilt = computed(() => ent.value?.tilt ?? 0);

const subtitle = computed(() => `${position.value}% • Lamele ${tilt.value}°`);
const iconClass = computed(() =>
  position.value > 0 ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.1] text-white/75 hover:bg-white/[0.16]',
);

const rootEl = ref<HTMLElement | null>(null);
let startY = 0;
let startPosition = 0;
let moved = false;
let dragging = false;

function onPointerDown(e: PointerEvent) {
  dragging = true;
  moved = false;
  startY = e.clientY;
  startPosition = position.value;
}

function onPointerMove(e: PointerEvent) {
  if (!dragging) return;
  if (!moved && Math.abs(e.clientY - startY) > 5) moved = true;
  if (!moved) return;
  const rect = rootEl.value?.getBoundingClientRect();
  if (!rect) return;
  const value = clamp(Math.round(startPosition - ((e.clientY - startY) / Math.max(1, rect.height / 2)) * 100), 0, 100);
  store.patch(props.id, { position: value });
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
    class="flex flex-col h-full relative"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup.stop="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div class="absolute top-2 bottom-2 left-2 w-[52px] rounded-full bg-black/30 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <div
        class="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-[#3B6E6C]/80 to-[#73B7B2]/55 transition-all duration-100"
        :style="{ height: `calc(52px + (100% - 52px) * ${position / 100})` }"
      >
        <div class="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-white/50"></div>
      </div>
    </div>

    <div class="relative z-10 flex flex-col h-full">
      <TileTopRow
        :title="ent.title"
        :subtitle="subtitle"
        :icon-class="iconClass"
        :icon-type="ent.iconType ?? 'mdi'"
        :icon="ent.icon"
        :track-mode="'none'"
        :track-active="false"
        :track-pct="0"
        track-color-class=""
        :span-c="props.spanC"
        :main-buttons="ent.mainButtons ?? []"
        @icon-click="store.handleIconTap(props.id)"
        @main-click="(btn) => store.toggleMainButton(props.id, btn)"
      />

      <div class="mt-auto pt-1.5 flex flex-col gap-1.5 pl-[54px] pointer-events-auto" @pointerdown.stop>
        <button
          v-for="cmd in [
            { label: 'Otwórz 100%', icon: ArrowUp, pos: 100 },
            { label: 'Stop / 50%', icon: Pause, pos: 50 },
            { label: 'Zamknij 0%', icon: ArrowDown, pos: 0 },
          ]"
          :key="cmd.label"
          class="h-9 px-2.5 rounded-full flex items-center gap-2 text-[11px] font-semibold bg-black/25 hover:bg-black/40 text-white/90 transition-colors"
          @click.stop="store.patch(props.id, { position: cmd.pos })"
        >
          <component :is="cmd.icon" class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">{{ cmd.label }}</span>
        </button>
        <EmbeddedSliderRow
          v-if="props.spanC >= 4"
          label="Kąt nachylenia lameli"
          :value="tilt"
          :value-text="`${tilt}°`"
          color-class="bg-[#73B7B2]/45"
          @change="(v) => store.patch(props.id, { tilt: v })"
        />
      </div>
    </div>
  </div>
</template>
