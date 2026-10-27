<script setup lang="ts">
import { computed } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import { useHomeStore } from '../../store';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const modes = computed(() => ent.value?.modes ?? { cool: false, auto: false, heat: false });

const subtitle = computed(() => {
  const m = modes.value;
  if (!m.cool && !m.auto && !m.heat) return 'Wyłączone';
  const parts: string[] = [];
  if (m.heat) parts.push('Grzanie');
  if (m.cool) parts.push('Chłodzenie');
  if (m.auto) parts.push('Auto');
  return parts.join(' + ');
});

const iconClass = computed(() =>
  modes.value.cool || modes.value.heat || modes.value.auto
    ? 'bg-[#3B5268] text-white/90'
    : 'bg-white/[0.09] text-white/60 hover:bg-white/[0.16]',
);
</script>

<template>
  <div v-if="ent" class="flex flex-col h-full" @pointerup.stop="store.openModal(props.id)">
    <TileTopRow
      :title="ent.title"
      :subtitle="subtitle"
      :icon-class="iconClass"
      :icon-type="ent.iconType ?? 'lucide'"
      :icon="ent.icon"
      icon-size-class="w-5 h-5"
      :track-mode="'none'"
      :span-c="props.spanC"
      :main-buttons="ent.mainButtons ?? []"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="(btn) => store.toggleMainButton(props.id, btn)"
    />
  </div>
</template>
