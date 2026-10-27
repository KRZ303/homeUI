<script setup lang="ts">
import { computed } from 'vue';
import AppIcon from '../icons/AppIcon.vue';
import TileTopRow from '../TileTopRow.vue';
import { useHomeStore } from '../../store';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const members = computed(() => ent.value?.members ?? []);
const activeCount = computed(() => members.value.filter((m) => m.active).length);
const anyActive = computed(() => activeCount.value > 0);

const subtitle = computed(() => `${activeCount.value}/${members.value.length} • ${ent.value?.soilMoisture ?? 'Aktywne'}`);

const iconClass = computed(() =>
  anyActive.value ? 'bg-[#2C3745] text-[#73B7B2]' : 'bg-white/[0.08] text-white/60 hover:bg-white/[0.14]',
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
      track-mode="progress"
      :track-active="anyActive"
      :track-pct="members.length ? (activeCount / members.length) * 100 : 0"
      track-color-class="bg-[#73B7B2]/30"
      :span-c="props.spanC"
      :main-buttons="ent.mainButtons ?? []"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="(btn) => store.toggleMainButton(props.id, btn)"
    />

    <div
      v-if="props.spanR >= 2"
      class="mt-auto pt-2.5 grid gap-2"
      :class="spanC >= 4 ? 'grid-cols-4' : 'grid-cols-2'"
      @pointerdown.stop
    >
      <button
        v-for="m in members"
        :key="m.id"
        class="h-[34px] px-2 rounded-full flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-colors"
        :class="m.active ? 'bg-[#73B7B2] text-[#1D3130] shadow-sm' : 'bg-black/25 text-white/60 hover:bg-black/35'"
        @pointerdown.stop
        @click.stop="store.toggleCrossMember(props.id, m.id)"
      >
        <AppIcon :icon-type="m.iconType ?? 'lucide'" :icon="m.icon" icon-class="w-3.5 h-3.5 shrink-0" />
        <span v-if="props.spanC >= 4" class="truncate">{{ m.label }}</span>
      </button>
    </div>
  </div>
  <span v-else class="hidden">x</span>
</template>

<script lang="ts">
export default {
  name: 'GroupTile',
};
</script>
