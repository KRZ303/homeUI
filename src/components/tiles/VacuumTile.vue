<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { toggleIcon, vacuumZone } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()

const buttons = computed<MainButton[]>(() =>
  (entity.rooms ?? []).map((room) => ({
    id: `zone_${room.toLowerCase()}`,
    label: room,
    icon: 'Compass',
    active: entity.mode === room,
    showLabel: true,
  })),
)

function onMain(button: MainButton): void {
  vacuumZone(entity, button.label)
}
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none">
    <TileTopRow :entity="entity" :buttons="buttons" :on-button="onMain" @icon="toggleIcon(entity)" />
  </TileFrame>
</template>
