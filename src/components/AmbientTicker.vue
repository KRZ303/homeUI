<script setup lang="ts">
import type { LaneTicker } from '../types'
import AppIcon from './icons/AppIcon.vue'

defineProps<{
  ticker: LaneTicker
}>()
</script>

<template>
  <div class="flex h-8 w-full shrink-0 items-center gap-2 overflow-hidden">
    <div
      class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/70"
    >
      <AppIcon :name="ticker.leadIcon" :type="ticker.leadIconType" :size="14" />
    </div>
    <div class="ml-auto flex min-w-0 items-center justify-end gap-3 overflow-hidden sm:gap-4">
      <div
        v-for="item in ticker.items"
        :key="`${item.icon}-${item.text}`"
        class="flex min-w-0 shrink items-center gap-1.5 text-[11px] font-medium text-white/55"
      >
        <AppIcon :name="item.icon" :type="item.iconType" :size="12" class="shrink-0 text-white/40" />
        <span class="truncate tabular-nums text-white/75">{{ item.text }}</span>
      </div>
    </div>
  </div>
</template>
