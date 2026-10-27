<script setup lang="ts">
import { computed } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import { useHomeStore } from '../../store';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const subtitle = computed(() => {
  const e = ent.value;
  if (!e) return '';
  const state = e.locked ? 'Zamknięte' : 'Otwarte';
  return `${state} • ${e.lastActor ?? ''}`;
});

const iconClass = computed(() =>
  ent.value?.locked ? 'bg-white/[0.09] text-white/75 hover:bg-white/[0.15]' : 'bg-[#73B7B2] text-[#182C2A]',
);

const icon = computed(() => (ent.value?.locked ? 'Lock' : 'Unlock'));

const hasTravel = computed(() => ent.value?.position !== undefined);
</script>

<template>
  <div v-if="ent" class="flex flex-col h-full" @pointerup.stop="store.openModal(props.id)">
    <TileTopRow
      :title="ent.title"
      :subtitle="subtitle"
      :icon-class="iconClass"
      :icon-type="ent.iconType ?? 'lucide'"
      :icon="icon"
      :track-mode="hasTravel ? 'progress' : 'none'"
      :track-active="hasTravel ? !ent.locked : false"
      :track-pct="ent.position ?? 100"
      :track-color-class="hasTravel ? 'bg-[#3E5448]/85' : ''"
      :span-c="props.spanC"
      :main-buttons="[]"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="(btn) => store.toggleMainButton(props.id, btn)"
    />
  </div>
</template>
