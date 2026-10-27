<script setup lang="ts">
import { computed } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import { useHomeStore } from '../../store';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const iconClass = computed(() =>
  ent.value?.on ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.09] text-white/70 hover:bg-white/[0.16]',
);

const subtitle = computed(() =>
  ent.value?.on
    ? `${ent.value.mode} • Bateria ${ent.value.battery}%`
    : `W stacji dokującej • ${ent.value?.battery ?? 0}%`,
);

const buttons = computed(() =>
  (ent.value?.rooms ?? []).map((room) => ({
    id: `room_${room}`,
    label: room,
    icon: 'Compass',
    showLabel: true,
    active: Boolean(ent.value?.on),
  })),
);
</script>

<template>
  <div v-if="ent" class="flex flex-col h-full" @pointerup.stop="store.openModal(props.id)">
    <TileTopRow
      :title="ent.title"
      :subtitle="subtitle"
      :icon-class="iconClass"
      icon-type="mdi"
      icon="robot-vacuum"
      track-mode="progress"
      :track-active="Boolean(ent.on)"
      :track-pct="ent.progress ?? 0"
      track-color-class="bg-[#3B6E6C]/65"
      :span-c="props.spanC"
      :main-buttons="buttons"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="
        (btn) => {
          store.patch(props.id, { on: true, progress: 0, mode: `${btn.label} (strefa)` });
        }
      "
    />
  </div>
</template>
