<script setup lang="ts">
import { computed } from 'vue';
import { ChevronDown, ChevronRight, ArrowDownRight, ArrowUpLeft, CornerDownRight } from 'lucide-vue-next';
import { useHomeStore } from '../store';
import type { Entity } from '../types';
import TileDispatcher from './TileDispatcher.vue';

const props = withDefaults(defineProps<{ id: string; laneEntityIds?: string[] }>(), { laneEntityIds: () => [] });

const store = useHomeStore();

const ent = computed(() => store.entities[props.id]);

const surfaceClass = computed(() => {
  const e = ent.value;
  if (!e) return 'bg-[#303030]';
  if (e.type === 'sensor_graph') return 'bg-[#2E3440]';
  if (e.type === 'webrtc_camera_tile') return 'bg-[#26292E]';
  if (e.type === 'matter_fabric_hub') return 'bg-[#2B3B4E]';
  if (e.type === 'matter_context_tile' && e.active) return 'bg-[#2B3F46]';
  if (e.type === 'group_tile' && (e.members ?? []).some((m) => m.active)) return 'bg-[#31537A]';
  return 'bg-[#303030]';
});

const minHeight = computed(() => (ent.value?.span.r ?? 1) >= 3 ? '216px' : (ent.value?.span.r ?? 1) >= 2 ? '140px' : '68px');

const expanded = computed(
  () => ent.value && (ent.value.span.c > ent.value.defaultSpan.c || ent.value.span.r > ent.value.defaultSpan.r),
);

const showNestedDrawer = computed(
  () => (ent.value?.nestedTiles.length ?? 0) > 0 && Boolean(expanded.value) && (ent.value?.span.r ?? 1) >= 2,
);

const isDragSource = computed(() => store.dragTileId.value === props.id);
const isDropTarget = computed(() => store.dragTileId.value !== null && store.dragTileId.value !== props.id && store.dropTargetId.value === props.id);

const areaStyle = computed(() => ({
  gridColumn: `span ${ent.value?.span.c ?? 1}`,
  gridRow: `span ${ent.value?.span.r ?? 1}`,
  minHeight: minHeight.value,
}));
</script>

<template>
  <div
    :data-eid="id"
    class="relative rounded-[30px] p-3 overflow-visible select-none flex flex-col"
    :class="[surfaceClass, isDropTarget ? 'ring-2 ring-[#73B7B2]/70 brightness-110 z-20' : '', isDragSource ? 'opacity-40' : '']"
    :style="areaStyle"
  >
    <slot />

    <button
      v-if="ent?.expanders.down"
      class="absolute bottom-0.5 left-1/2 -translate-x-1/2 z-30 w-6 h-5 flex items-center justify-center text-white/35 hover:text-white/80 transition-colors"
      aria-label="Rozwiń w dół"
      @pointerdown.stop
      @click.stop="store.expandTile(id, 'down')"
    >
      <ChevronDown class="w-3.5 h-3.5" :style="expanded ? 'transform: rotate(180deg); color: #73B7B2' : ''" />
    </button>
    <button
      v-if="ent?.expanders.right"
      class="absolute right-0.5 top-1/2 -translate-y-1/2 z-30 w-5 h-6 flex items-center justify-center text-white/35 hover:text-white/80 transition-colors"
      aria-label="Rozwiń w bok"
      @pointerdown.stop
      @click.stop="store.expandTile(id, 'right')"
    >
      <ChevronRight class="w-3.5 h-3.5" :style="expanded ? 'transform: rotate(180deg); color: #73B7B2' : ''" />
    </button>
    <button
      v-if="ent?.expanders.diagonal"
      class="absolute bottom-1 right-1.5 z-30 w-5 h-5 flex items-center justify-center text-white/35 hover:text-white/80 transition-colors"
      aria-label="Rozwiń ukośnie"
      @pointerdown.stop
      @click.stop="store.expandTile(id, 'diagonal')"
    >
      <ArrowUpLeft v-if="expanded" class="w-3.5 h-3.5 text-[#73B7B2]" />
      <ArrowDownRight v-else class="w-3.5 h-3.5" />
    </button>

    <div
      v-if="showNestedDrawer"
      class="relative z-20 mt-2.5 pt-2.5 border-t border-white/10 flex flex-col gap-2"
      @pointerdown.stop
      @click.stop
    >
      <div class="flex items-center justify-between text-[11px] text-[#73B7B2] font-semibold px-1">
        <span class="flex items-center gap-1.5">
          <CornerDownRight class="w-3 h-3" />
          Zagnieżdżone kafelki ({{ ent?.nestedTiles.length }})
        </span>
      </div>
      <div class="grid grid-cols-4 gap-2">
        <TileDispatcher
          v-if="ent"
          v-for="nestedId in ent.nestedTiles"
          :key="nestedId"
          :id="nestedId"
          :lane-entity-ids="laneEntityIds"
          nested
        />
      </div>
    </div>
  </div>
</template>
