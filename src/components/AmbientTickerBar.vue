<script setup lang="ts">
import AppIcon from './icons/AppIcon.vue';
import type { Lane } from '../types';

defineProps<{ lane: Lane }>();
</script>

<template>
  <div class="grid grid-cols-4 h-8 items-center select-none pointer-events-none">
    <div class="col-span-4 flex items-center gap-3">
      <span class="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
        <AppIcon icon-type="lucide" :icon="lane.ticker.lead" icon-class="w-3.5 h-3.5 text-[#73B7B2]" />
      </span>
      <div class="ml-auto flex items-center gap-4 text-[11px] font-semibold text-white/65 flex-nowrap overflow-hidden whitespace-nowrap min-w-0">
        <span v-for="item in lane.ticker.items" :key="item.icon + item.text" class="flex items-center gap-1.5 shrink-0">
          <AppIcon icon-type="lucide" :icon="item.icon" icon-class="w-3.5 h-3.5 text-white/45" />
          <span class="tabular-nums whitespace-nowrap">{{ item.text }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
