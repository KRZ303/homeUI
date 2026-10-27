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
  entity.mounted
    ? 'bg-emerald-500/20 text-emerald-300'
    : 'bg-amber-400 text-black',
)
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none" surface-class="bg-[#303030]">
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      track-mode="progress"
      :track-active="!entity.mounted"
      :track-pct="100"
      track-fill-class="bg-rose-600/55"
      @icon="toggleIcon(entity)"
    />
  </TileFrame>
</template>
