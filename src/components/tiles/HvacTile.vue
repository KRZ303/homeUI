<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { setHvacMode, toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()

const buttons = computed<MainButton[]>(() => [
  {
    id: 'cool',
    label: 'Chłodzenie',
    icon: 'Snowflake',
    active: entity.modes?.cool ?? false,
    activeClass: 'bg-[#3B82A6] text-white',
  },
  {
    id: 'auto',
    label: 'Auto',
    icon: 'Plug',
    active: Boolean(entity.modes?.auto && !entity.modes?.heat),
    activeClass: 'bg-[#73B7B2] text-[#1A2E2C]',
  },
  {
    id: 'heat',
    label: 'Grzanie',
    icon: 'Flame',
    active: entity.modes?.heat ?? false,
    activeClass: 'bg-[#D96B27] text-[#1E120A]',
  },
])

function onMain(button: MainButton): void {
  setHvacMode(entity, button.id as 'cool' | 'auto' | 'heat')
}
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none">
    <TileTopRow :entity="entity" :buttons="buttons" :on-button="onMain" @icon="toggleIcon(entity)" />
  </TileFrame>
</template>
