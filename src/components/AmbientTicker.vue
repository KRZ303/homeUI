<script setup lang="ts">
import type { Lane } from '../types'
import AppIcon from './icons/AppIcon.vue'

defineProps<{ lane: Lane }>()
</script>

<template>
  <div class="col-span-full flex h-8 shrink-0 items-center gap-3 px-1">
    <div
      class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-white/80"
    >
      <AppIcon :name="lane.ticker.leadIcon" :icon-type="lane.ticker.leadIconType" :size="14" />
    </div>
    <div
      class="flex min-w-0 flex-1 items-center gap-4 overflow-hidden text-[11px] tabular-nums text-white/55"
    >
      <span
        v-for="(item, index) in lane.ticker.items"
        :key="index"
        class="flex shrink-0 items-center gap-1.5"
      >
        <AppIcon :name="item.icon" :icon-type="item.iconType" :size="12" class="text-white/45" />
        <span class="truncate">{{ item.text }}</span>
      </span>
    </div>
  </div>
</template>
