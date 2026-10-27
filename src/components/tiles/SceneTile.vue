<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { Entity } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { effectiveSpan } from '../../utils/tile'
import { toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))
const flashing = ref(false)
let timer: number | undefined

const iconClass = computed(() =>
  flashing.value || entity.active
    ? 'bg-[#73B7B2] text-[#182C2A]'
    : 'bg-white/[0.08] text-white/75',
)

function onIcon(): void {
  toggleIcon(entity)
  flashing.value = true
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    flashing.value = false
  }, 650)
}

onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none" surface-class="bg-[#303030]" :class="flashing ? 'ets-scene-flash' : ''">
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      track-mode="progress"
      :track-active="flashing"
      :track-pct="100"
      track-fill-class="bg-[#73B7B2]/35"
      :subtitle="span.c === 1 ? null : entity.active ? 'aktywna' : 'scena'"
      @icon="onIcon"
    />
  </TileFrame>
</template>
