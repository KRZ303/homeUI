<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Entity } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import type { TrackModel } from '../../utils/tile'
import { effectiveSpan } from '../../utils/tile'
import { toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))

const flashing = ref(false)
let flashTimer: number | undefined

function onIcon(): void {
  flashing.value = true
  window.clearTimeout(flashTimer)
  flashTimer = window.setTimeout(() => {
    flashing.value = false
  }, 650)
  toggleIcon(entity)
}

const track = computed<TrackModel>(() =>
  flashing.value
    ? { mode: 'progress', active: true, pct: 100, colorClass: 'bg-[#73B7B2]/35' }
    : { mode: 'none', active: false, pct: 0, colorClass: '' },
)

const iconClass = computed(() =>
  flashing.value || entity.active
    ? 'bg-[#73B7B2] text-[#182C2A]'
    : 'bg-white/[0.08] text-white/75 hover:bg-white/[0.15]',
)
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none">
    <TileTopRow
      :entity="entity"
      :icon-class="iconClass"
      :track="track"
      :subtitle="span.c >= 2 ? (entity.active ? 'aktywna' : 'scena') : null"
      @icon="onIcon"
    />
  </TileFrame>
</template>
