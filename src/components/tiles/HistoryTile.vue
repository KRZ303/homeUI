<script setup lang="ts">
import { computed } from 'vue'
import type { Entity } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { effectiveSpan } from '../../utils/tile'
import { toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))
const events = computed(() => entity.events ?? [])
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none">
    <TileTopRow :entity="entity" @icon="toggleIcon(entity)" />

    <div
      v-if="span.r >= 2"
      class="mt-auto space-y-1.5 pt-2.5"
      data-no-tile
      @pointerdown.stop
      @click.stop
    >
      <div
        v-for="event in events"
        :key="event.time"
        class="flex items-center justify-between gap-2 rounded-full bg-black/25 px-3 py-1.5 text-xs text-white/80"
      >
        <span class="min-w-0 truncate">{{ event.label }}</span>
        <span class="shrink-0 font-mono text-[#73B7B2]">{{ event.time }}</span>
      </div>
    </div>
  </TileFrame>
</template>
