<script setup lang="ts">
import { computed } from 'vue'
import type { Entity } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { effectiveSpan } from '../../utils/tile'
import { toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))

const unlocked = computed(() => !entity.locked)
const iconName = computed(() => (entity.locked ? 'Lock' : 'Unlock'))
const iconClass = computed(() =>
  unlocked.value
    ? 'bg-[#73B7B2] text-[#182C2A]'
    : 'bg-white/[0.09] text-white/75',
)
const hasTravel = computed(() => unlocked.value && entity.position !== undefined)
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none" surface-class="bg-[#303030]">
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      :icon-name="iconName"
      :track-mode="hasTravel ? 'progress' : 'none'"
      :track-active="hasTravel"
      :track-pct="entity.position ?? 0"
      track-fill-class="bg-[#3E5448]/85"
      @icon="toggleIcon(entity)"
    />
  </TileFrame>
</template>
