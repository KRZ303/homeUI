<script setup lang="ts">
import { computed } from 'vue';
import TileTopRow from '../TileTopRow.vue';
import { Eye, EyeOff } from 'lucide-vue-next';
import { useHomeStore } from '../../store';

const props = defineProps<{ id: string; spanC: number; spanR: number; laneEntityIds?: string[]; nested?: boolean }>();
const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const subtitle = computed(() =>
  ent.value?.active ? ent.value?.activity ?? '' : 'Czujnik prywatności wyciszony',
);

const iconClass = computed(() =>
  ent.value?.active ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.09] text-white/60 hover:bg-white/[0.16]',
);

function buttonClass(btn: { active?: boolean; customActiveClass?: string }) {
  if (btn.customActiveClass && btn.active) return btn.customActiveClass;
  return btn.active
    ? 'bg-[#73B7B2]/30 text-teal-50 border border-[#73B7B2]/45 backdrop-blur-[2px] hover:bg-[#73B7B2]/40'
    : 'bg-black/25 text-white/90 border border-white/10 backdrop-blur-[2px] hover:bg-black/40';
}
</script>

<template>
  <div v-if="ent" class="flex flex-col h-full" @pointerup.stop="store.openModal(props.id)">
    <div class="flex items-center gap-3 shrink-0">
      <button
        class="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90"
        :class="iconClass"
        @pointerdown.stop
        @click.stop="store.handleIconTap(props.id)"
      >
        <Eye v-if="ent.active" class="w-5 h-5" />
        <EyeOff v-else class="w-5 h-5" />
      </button>
      <div class="min-w-0">
        <div class="text-[15px] font-bold text-white leading-tight truncate">{{ ent.title }}</div>
        <div class="text-[11px] text-white/80 leading-tight mt-0.5 truncate">{{ subtitle }}</div>
      </div>
      <div v-if="ent.mainButtons?.length" class="ml-auto flex items-center gap-1.5">
        <button
          v-for="btn in ent.mainButtons.slice(0, 4)"
          :key="btn.id"
          class="h-9 px-3.5 rounded-full flex items-center gap-2 text-xs font-semibold whitespace-nowrap transition-colors"
          :class="buttonClass(btn)"
          @pointerdown.stop
          @click.stop="btn.active = !btn.active"
        >
          {{ btn.label }}
        </button>
      </div>
    </div>

    <div
      v-if="props.spanR >= 2 && (ent.soundContext || ent.prediction)"
      class="mt-auto pt-2.5 flex flex-col gap-2"
      @pointerdown.stop
    >
      <div
        v-if="ent.soundContext"
        class="h-9 rounded-full bg-black/25 px-3.5 flex items-center text-[11px] font-semibold text-teal-300 truncate"
      >
        Dźwięk: {{ ent.soundContext }}
      </div>
      <div
        v-if="ent.prediction"
        class="h-9 rounded-full bg-black/25 px-3.5 flex items-center text-[11px] font-semibold text-teal-300 truncate"
      >
        {{ ent.prediction }}
      </div>
    </div>
  </div>
</template>
