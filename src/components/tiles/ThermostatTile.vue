<script setup lang="ts">
import { computed } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import { useHomeStore } from '../../store';
import { fmtTemp } from '../../utils/format';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const iconClass = computed(() =>
  (ent.value?.demand ?? 0) > 0 ? 'bg-amber-500/35 text-amber-200' : 'bg-white/[0.08] text-white/65 hover:bg-white/[0.15]',
);

const subtitle = computed(() => `${fmtTemp(ent.value?.targetTemp)} °C • ${ent.value?.demand ?? 0}%`);

const buttons = computed(() => {
  const e = ent.value;
  if (!e) return [];
  const btns = [
    { id: 'down', label: 'Obniż (-0,5°C)', icon: 'Minus', showLabel: true },
    { id: 'up', label: 'Podwyższ (+0,5°C)', icon: 'Plus', showLabel: true },
  ];
  if (e.matterSuggestion?.active) {
    btns.push({
      id: 'suggest',
      label: `Sugestia ${fmtTemp(e.matterSuggestion.suggestedTemp)}°C`,
      icon: 'Sparkles',
      showLabel: true,
    });
  } else {
    btns.push({ id: 'suggest', label: 'Sugestia 22,0°C', icon: 'Sparkles', showLabel: true });
  }
  return btns;
});

const PRESETS = [
  { label: 'Eco 19°C', temp: 19, demand: 0 },
  { label: 'Komfort 22°C', temp: 22, demand: 35 },
  { label: 'Boost 25°C', temp: 25, demand: 70 },
];

function applyPreset(p: (typeof PRESETS)[number]) {
  store.patch(props.id, { targetTemp: p.temp, demand: p.demand, preset: p.label.split(' ')[0] });
  store.toast(`Preset: ${p.label}`);
}

function acceptSuggestion() {
  const s = ent.value?.matterSuggestion;
  if (!s) return;
  store.patch(props.id, { targetTemp: s.suggestedTemp, demand: 55 });
  store.toast(`Matter 1.6 sugestia przyjęta: ${s.source} (${fmtTemp(s.suggestedTemp)}°C)`);
}
</script>

<template>
  <div v-if="ent" class="flex flex-col h-full" @pointerup.stop="store.openModal(props.id)">
    <TileTopRow
      :title="ent.title"
      :subtitle="subtitle"
      :icon-class="iconClass"
      :icon-type="ent.iconType ?? 'lucide'"
      :icon="ent.icon ?? 'Thermometer'"
      track-mode="progress"
      :track-active="(ent.demand ?? 0) > 0"
      :track-pct="ent.demand ?? 0"
      track-color-class="bg-[#9E5231]/75"
      :span-c="props.spanC"
      :main-buttons="buttons as any"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="(btn: any) => store.toggleMainButton(props.id, btn)"
    />

    <div v-if="props.spanR >= 2" class="mt-auto pt-2.5 flex flex-col gap-2" @pointerdown.stop>
      <div
        v-if="ent.matterSuggestion?.active"
        class="h-9 rounded-full bg-[#2C3745] px-3 flex items-center gap-2 text-[11px] font-semibold text-teal-200"
      >
        <span class="truncate flex-1">Matter 1.6: {{ ent.matterSuggestion.source }} ({{ fmtTemp(ent.matterSuggestion.suggestedTemp) }}°C)</span>
        <button
          class="h-7 px-3 rounded-full bg-[#73B7B2] text-[#182C2A] font-bold text-[11px] shrink-0"
          @click.stop="acceptSuggestion"
        >
          Przyjmij
        </button>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="p in PRESETS"
          :key="p.label"
          class="h-9 px-3.5 rounded-full flex items-center justify-center text-[11px] font-semibold bg-black/25 hover:bg-black/40 text-white/85 transition-colors"
          :class="ent.preset === p.label.split(' ')[0] ? 'bg-[#73B7B2] text-[#182C2A]' : ''"
          @click.stop="applyPreset(p)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>
  </div>
</template>
