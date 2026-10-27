<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import EmbeddedSlider from '../EmbeddedSlider.vue'
import { decimalComma } from '../../utils/format'
import { effectiveSpan } from '../../utils/tile'
import { acStepTarget, acToggle, setFanSpeed, toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))

const buttons = computed<MainButton[]>(() => [
  { id: 'swing', label: 'Swing', icon: 'ac-swing', iconType: 'mdi', active: Boolean(entity.swing), showLabel: true },
  { id: 'fan', label: 'Wentylator', icon: 'Fan', active: Boolean(entity.fan), showLabel: true },
  { id: 'ionizer', label: 'Jonizacja', icon: 'ionizer', iconType: 'mdi', active: Boolean(entity.ionizer), showLabel: true },
  {
    id: 'temp',
    label: `${decimalComma(entity.targetTemp ?? 22)}°C`,
    icon: 'Thermometer',
    active: Boolean(entity.on),
    showLabel: true,
  },
])

function onMain(button: MainButton): void {
  if (button.id === 'temp') acStepTarget(entity)
  else acToggle(entity, button.id as 'swing' | 'fan' | 'ionizer')
}
</script>

<template>
  <TileFrame
    :entity="entity"
    drag-mode="horizontal"
    surface-class="bg-[#303030]"
    @slide="setFanSpeed(entity, $event)"
  >
    <TileTopRow :entity="entity" :buttons="buttons" :on-button="onMain" @icon="toggleIcon(entity)" />

    <EmbeddedSlider
      v-if="span.r >= 2 && entity.expandedContent.secondarySlider"
      class="mt-auto pt-2.5"
      label="Prędkość turbiny nawiewu"
      :value="entity.fanSpeedPct ?? 0"
      @update="setFanSpeed(entity, $event)"
    />
  </TileFrame>
</template>
