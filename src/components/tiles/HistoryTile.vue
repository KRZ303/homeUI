<script setup lang="ts">
import { computed } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import { useHomeStore } from '../../store';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const subtitle = computed(() => {
  const e = ent.value?.events?.[0];
  return e ? `${e.time} — ${e.label}` : 'Brak zdarzeń';
});

const iconClass = computed(() =>
  ent.value?.armed ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.09] text-white/70 hover:bg-white/[0.16]',
);
</script>

<template>
  <div v-if="ent" class="flex flex-col h-full" @pointerup.stop="store.openModal(props.id)">
    <TileTopRow
      :title="ent.title"
      :subtitle="subtitle"
      :icon-class="iconClass"
      icon-type="lucide"
      icon="History"
      track-mode="none"
      :track-active="false"
      :span-c="props.spanC"
      :main-buttons="[]"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="(btn) => store.toggleMainButton(props.id, btn)"
    />

    <div v-if="props.spanR >= 2 && ent.events?.length" class="mt-auto pt-2.5 space-y-1.5" @pointerdown.stop>
      <div
        v-for="ev in ent.events"
        :key="ev.time + ev.label"
        class="text-xs text-white/80 flex items-center justify-between bg-black/25 px-3 py-1.5 rounded-full"
      >
        <span class="truncate">{{ ev.label }}</span>
        <span class="font-mono text-[#73B7B2] shrink-0 pl-2">{{ ev.time }}</span>
      </div>
    </div>
  </div>
</template>
