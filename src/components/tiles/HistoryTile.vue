<script setup lang="ts">
import { computed } from 'vue'
import type { Entity } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { effectiveSpan } from '../../utils/tile'
import { toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))

const iconClass = computed(() =>
  entity.armed
    ? 'bg-[#73B7B2] text-[#182C2A]'
    : 'bg-white/[0.09] text-white/70',
)
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none" surface-class="bg-[#303030]">
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      track-mode="none"
      @icon="toggleIcon(entity)"
    />

    <div v-if="span.r >= 2" class="mt-auto space-y-1.5 pt-2.5">
      <div
        v-for="event in entity.events"
        :key="event.time + event.label"
        class="flex items-center justify-between gap-2 rounded-full bg-black/25 px-3 py-1.5 text-[10px] text-white/80"
      >
        <span class="truncate">{{ event.label }}</span>
        <span class="shrink-0 font-mono text-[10px] text-[#73B7B2]">{{ event.time }}</span>
      </div>
    </div>
  </TileFrame>
</template>
