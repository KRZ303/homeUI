<script setup lang="ts">
import { computed } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import { useHomeStore } from '../../store';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const iconClass = computed(() =>
  ent.value?.active ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.08] text-white/75 hover:bg-white/[0.14]',
);

const subtitle = computed(() => {
  if ((props.spanC ?? 1) < 2) return null;
  return ent.value?.active ? 'aktywna' : 'scena';
});
</script>

<template>
  <div v-if="ent" class="flex flex-col h-full" @pointerup.stop="store.openModal(props.id)">
    <TileTopRow
      :title="ent.title"
      :subtitle="subtitle"
      :icon-class="iconClass"
      :icon-type="ent.iconType ?? 'lucide'"
      :icon="ent.icon"
      track-mode="progress"
      :track-active="Boolean(ent.active)"
      :track-pct="100"
      track-color-class="bg-[#73B7B2]/35"
      :span-c="props.spanC"
      :main-buttons="ent.mainButtons ?? []"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="(btn) => store.toggleMainButton(props.id, btn)"
    />
    <div v-if="props.spanR >= 2" class="mt-auto pt-2.5 text-[11px] text-white/45 truncate">
      {{ ent.matterType }}
    </div>
  </div>
</template>
