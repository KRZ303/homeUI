<script setup lang="ts">
import { computed } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import { useHomeStore } from '../../store';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const subtitle = computed(() => `Thread 1.4 (${ent.value?.threadNodes ?? 0} węzłów) • Wspólny Datastore`);

const buttons = computed(() =>
  (ent.value?.ecosystems ?? []).map((label) => ({ id: label, label, icon: 'Wifi', showLabel: true, active: true })),
);
</script>

<template>
  <div v-if="ent" class="flex flex-col h-full" @pointerup.stop="store.openModal(props.id)">
    <TileTopRow
      :title="ent.title"
      :subtitle="subtitle"
      icon-class="bg-[#73B7B2] text-[#182C2A]"
      icon-type="lucide"
      icon="Radio"
      track-mode="none"
      :span-c="props.spanC"
      :main-buttons="buttons"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="(btn) => store.toggleMainButton(props.id, btn)"
    />
  </div>
</template>
