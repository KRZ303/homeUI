<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { effectiveSpan, surfaceClassFor } from '../../utils/tile'
import { showToast, toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))

const buttons = computed<MainButton[]>(() =>
  (entity.ecosystems ?? []).map((ecosystem) => ({
    id: ecosystem,
    label: ecosystem,
    icon: 'Wifi',
    active: true,
    showLabel: true,
  })),
)

function onMain(button: MainButton): void {
  showToast(`Zsynchronizowano wspólny Datastore Joint Fabric z ${button.label}`)
}
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none" :surface-class="surfaceClassFor(entity)">
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="'bg-[#73B7B2] text-[#182C2A]'"
      :buttons="buttons"
      track-mode="none"
      @icon="toggleIcon(entity)"
      @main="onMain"
    />
  </TileFrame>
</template>
