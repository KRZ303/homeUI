<script setup lang="ts">
import { computed } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import { useHomeStore } from '../../store';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const mounted = computed(() => ent.value?.mounted ?? true);

const subtitle = computed(() =>
  mounted.value ? `Zamontowany w uchwycie • CO ${ent.value?.coPpm ?? 0} ppm` : 'UWAGA: Zdjęto z uchwytu sufitowego!',
);

const iconClass = computed(() =>
  mounted.value ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-400 text-black',
);
</script>

<template>
  <div v-if="ent" class="flex flex-col h-full" @pointerup.stop="store.openModal(props.id)">
    <TileTopRow
      :title="ent.title"
      :subtitle="subtitle"
      :icon-class="iconClass"
      icon-type="lucide"
      icon="TriangleAlert"
      track-mode="progress"
      :track-active="!mounted"
      :track-pct="100"
      track-color-class="bg-rose-600/55"
      :span-c="props.spanC"
      :main-buttons="[]"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="(btn) => store.toggleMainButton(props.id, btn)"
    />
  </div>
</template>
