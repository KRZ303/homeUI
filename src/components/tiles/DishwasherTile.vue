<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import AppIcon from '../icons/AppIcon.vue';
import TileTopRow from '../TileTopRow.vue';
import { Clock, Play, Pause, Square, ChevronDown, Sparkles, Wind, Car } from 'lucide-vue-next';
import { useHomeStore } from '../../store';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const isEv = computed(() => ent.value?.iconName === 'ev-car');
const isIdle = computed(() => ent.value?.state !== 'running' && ent.value?.state !== 'paused');
const iconClass = computed(() => (isIdle.value ? 'bg-white/[0.09] text-white/70' : 'bg-[#73B7B2] text-[#182C2A]'));
const iconType = computed<'lucide' | 'mdi'>(() => (isEv.value ? 'lucide' : 'mdi'));
const iconName = computed(() => (isEv.value ? 'Car' : ent.value?.iconName ?? 'door-closed'));

const buttons = computed(() => {
  const e = ent.value;
  if (!e || !isIdle.value) return [];
  return [
    { id: 'delay', label: `Start za ${e.delay ?? '0:00'}`, icon: 'Clock', showLabel: true },
    { id: 'start', label: 'Start!', icon: 'Play', showLabel: true },
  ];
});

const runningButtons = computed(() => {
  const e = ent.value;
  if (!e || !isIdle.value) return [];
  return [
    { id: 'pause', label: e.state === 'paused' ? 'Wznów' : 'Pauza', icon: e.state === 'paused' ? 'Play' : 'Pause', showLabel: true },
    { id: 'finish', label: 'Zakończ', icon: 'Square', showLabel: true, active: false },
  ];
});

const subtitle = computed(() => {
  const e = ent.value;
  if (!e) return '';
  if (isIdle.value) return `${e.doorClosed ? 'zamknięto' : 'otwarte'} • gotowe`;
  return `${e.state === 'paused' ? 'Wstrzymano' : 'W trakcie'} • ${e.remainingMinutes} min (${e.progress}%)`;
});

const DELAY_OPTIONS = ['0:00', '1:00', '2:00', '4:00'];

const PROGRAMMES: Record<string, string[]> = {
  appliance_zmywara: ['Intensywny 70°C', 'Auto 45-65°C', 'Eco 50°C', 'Szybki 45°C'],
  appliance_pralka: ['Bawełna Eco 40°C • 1200 obr.', 'Syntetyki 30°C • 800 obr.', 'Delikatne Eco 60°C', 'Wirowanie + odpomp.'],
};

const programmeLabel = computed(() => ent.value?.programme ?? 'Program');

function cycleProgramme() {
  const opts = PROGRAMMES[props.id];
  if (!opts || !ent.value) return;
  const idx = opts.indexOf(ent.value.programme ?? '');
  ent.value.programme = opts[(idx + 1) % opts.length];
}

const modifiers = computed(() => {
  const e = ent.value;
  if (!e) return [];
  if (isEv.value) {
    return [
      { id: 'cleanPlus', label: 'Solar PV', Comp: Sparkles, active: e.cleanPlus, key: 'cleanPlus' },
      { id: 'speedPlus', label: 'V2H 11kW', Comp: Clock, active: e.speedPlus, key: 'speedPlus' },
      { id: 'dryPlus', label: 'Limit 80%', Comp: Wind, active: e.dryPlus, key: 'dryPlus' },
    ];
  }
  return [
    { id: 'cleanPlus', label: 'Clean+', Comp: Sparkles, active: e.cleanPlus, key: 'cleanPlus' },
    { id: 'speedPlus', label: 'Speed+', Comp: Clock, active: e.speedPlus, key: 'speedPlus' },
    { id: 'dryPlus', label: 'Dry+', Comp: Wind, active: e.dryPlus, key: 'dryPlus' },
  ];
});

function cycleDelay() {
  const e = ent.value;
  if (!e) return;
  const idx = DELAY_OPTIONS.indexOf(e.delay ?? '0:00');
  store.patch(props.id, { delay: DELAY_OPTIONS[(idx + 1) % DELAY_OPTIONS.length] });
}

// live 2200ms progress timer while running
const timer = ref<ReturnType<typeof setInterval> | null>(null);
watch(
  () => ent.value?.state,
  (s) => {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
    if (s === 'running') {
      timer.value = setInterval(() => {
        const e = store.entities[props.id];
        if (!e || e.state !== 'running') return;
        const p = Math.min(100, (e.progress ?? 0) + 1);
        const rm = Math.max(0, (e.remainingMinutes ?? 0) - 1);
        if (p >= 100) store.patch(props.id, { state: 'idle', progress: 0, remainingMinutes: 0 });
        else store.patch(props.id, { progress: p, remainingMinutes: rm });
      }, 2200);
    }
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  if (timer.value) clearInterval(timer.value);
});
</script>

<template>
  <div v-if="ent" class="flex flex-col h-full" @pointerup.stop="store.openModal(props.id)">
    <TileTopRow
      :title="ent.title"
      :subtitle="subtitle"
      :icon-class="iconClass"
      :icon-type="iconType"
      :icon="iconName"
      track-mode="progress"
      :track-active="!isIdle"
      :track-pct="ent.progress ?? 0"
      track-color-class="bg-[#3B6E6C]/70"
      :span-c="props.spanC"
      :main-buttons="isIdle ? buttons : runningButtons"
      @icon-click="store.handleIconTap(props.id)"
      @main-click="
        (btn) =>
          btn.id === 'delay'
            ? cycleDelay()
            : btn.id === 'start'
              ? store.handleIconTap(props.id)
              : store.toggleMainButton(props.id, btn)
      "
    />

    <div v-if="props.spanR >= 2" class="mt-auto pt-2.5 grid grid-cols-2 gap-2" @pointerdown.stop>
      <button
        class="h-9 px-3.5 rounded-full bg-black/25 hover:bg-black/40 text-xs font-semibold text-teal-200 flex items-center justify-center gap-1.5 transition-colors"
        @click.stop="cycleProgramme"
      >
        <span class="truncate">{{ programmeLabel }}</span>
        <ChevronDown class="w-3.5 h-3.5 shrink-0" />
      </button>
      <div class="flex items-center gap-1.5">
        <button
          v-for="mod in modifiers"
          :key="mod.id"
          class="h-9 min-w-0 px-1.5 flex-1 rounded-full text-[10px] font-medium flex items-center justify-center gap-1 transition-colors truncate"
          :class="mod.active ? 'bg-[#73B7B2] text-[#1A2E2C]' : 'bg-white/[0.05] hover:bg-white/[0.1] text-white'"
          @click.stop="store.patch(props.id, { [mod.key]: !mod.active })"
        >
          <component :is="mod.Comp" class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">{{ mod.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
