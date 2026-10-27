<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { fabricSync, toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()

const buttons = computed<MainButton[]>(() =>
  (entity.ecosystems ?? []).map((ecosystem) => ({
    id: `eco_${ecosystem.toLowerCase().replace(/\s+/g, '_')}`,
    label: ecosystem,
    icon: 'Wifi',
    active: true,
    showLabel: true,
  })),
)

function onMain(button: MainButton): void {
  fabricSync(entity, button.label)
}
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none">
    <TileTopRow :entity="entity" :buttons="buttons" :on-button="onMain" @icon="toggleIcon(entity)" />
  </TileFrame>
</template>
