<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { effectiveSpan } from '../../utils/tile'
import { showToast, toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))
const selectedRoom = ref<string | null>(null)

const iconClass = computed(() =>
  entity.on
    ? 'bg-[#73B7B2] text-[#182C2A]'
    : 'bg-white/[0.09] text-white/70',
)

const buttons = computed<MainButton[]>(() =>
  (entity.rooms ?? []).map((room) => ({
    id: room,
    label: room,
    icon: 'Compass',
    active: selectedRoom.value === room,
    showLabel: true,
  })),
)

function onMain(button: MainButton): void {
  selectedRoom.value = button.id
  showToast(`Wysyłam robota do strefy: ${button.label}`)
}
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none" surface-class="bg-[#303030]">
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      :buttons="buttons"
      track-mode="progress"
      :track-active="Boolean(entity.on)"
      :track-pct="entity.progress ?? 0"
      track-fill-class="bg-[#3B6E6C]/65"
      @icon="toggleIcon(entity)"
      @main="onMain"
    />
  </TileFrame>
</template>
