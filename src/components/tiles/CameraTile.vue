<script setup lang="ts">
import { computed } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import { useHomeStore } from '../../store';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const subtitle = computed(() => (ent.value?.privacy ? 'WebRTC wył.' : ent.value?.ptzPreset ?? ''));

const iconClass = computed(() =>
  !ent.value?.privacy ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-rose-500/30 text-rose-200',
);

const buttons = computed(() => [
  { id: 'ptz', label: 'Preset PTZ', icon: 'Compass', active: false },
  { id: 'privacy', label: 'Prywatność', icon: 'Eye', active: !ent.value?.privacy },
]);
</script>

<template>
  <div v-if="ent" class="flex flex-col h-full" @pointerup.stop="store.openModal(props.id)">
    <TileTopRow
      :title="ent.title"
      :subtitle="subtitle"
      :icon-class="iconClass"
      :icon-type="ent.iconType ?? 'lucide'"
      :icon="ent.icon ?? 'Camera'"
      track-mode="none"
      :span-c="props.spanC"
      :main-buttons="buttons"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="(btn) => store.toggleMainButton(props.id, btn)"
    />

    <div v-if="props.spanR >= 2" class="mt-auto pt-2.5 flex items-center gap-2" @pointerdown.stop>
      <span
        v-if="ent.detections"
        class="h-8 min-w-0 flex-1 rounded-full bg-black/30 px-3 flex items-center text-[11px] font-semibold text-white/80 truncate"
      >
        {{ ent.detections }}
      </span>
      <span
        v-if="!ent.privacy"
        class="h-8 shrink-0 rounded-full bg-emerald-500/20 text-emerald-300 px-3 flex items-center gap-1.5 text-[11px] font-bold"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        LIVE
      </span>
    </div>
  </div>
</template>
