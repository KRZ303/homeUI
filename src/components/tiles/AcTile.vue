<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import EmbeddedSlider from '../EmbeddedSlider.vue'
import { effectiveSpan } from '../../utils/tile'
import { fixedPL } from '../../utils/format'
import { setFanSpeed, toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))

const iconClass = computed(() =>
  entity.on
    ? 'bg-[#73B7B2] text-[#182C2A]'
    : 'bg-white/[0.09] text-white/70',
)

const buttons = computed<MainButton[]>(() => [
  {
    id: 'swing',
    label: 'Swing',
    icon: 'ac-swing',
    iconType: 'mdi',
    active: Boolean(entity.swing),
  },
  {
    id: 'fan',
    label: 'Wentylator',
    icon: 'Fan',
    active: Boolean(entity.fan),
  },
  {
    id: 'ionizer',
    label: 'Jonizacja',
    icon: 'ionizer',
    iconType: 'mdi',
    active: Boolean(entity.ionizer),
  },
  {
    id: 'temp',
    label: `${fixedPL(entity.targetTemp ?? 22)}°C`,
    icon: 'Thermometer',
    active: Boolean(entity.on),
    showLabel: true,
  },
])

function onMain(button: MainButton): void {
  if (button.id === 'swing') entity.swing = !entity.swing
  if (button.id === 'fan') entity.fan = !entity.fan
  if (button.id === 'ionizer') entity.ionizer = !entity.ionizer
  if (button.id === 'temp') {
    const next = Math.round(((entity.targetTemp ?? 22) + 0.5) * 10) / 10
    entity.targetTemp = next > 30 ? 16 : next
    entity.on = true
  }
}

function onFanSpeed(value: number): void {
  setFanSpeed(entity, value)
}
</script>

<template>
  <TileFrame
    :entity="entity"
    drag-mode="horizontal"
    surface-class="bg-[#303030]"
    @slide="setFanSpeed(entity, $event)"
  >
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      :buttons="buttons"
      track-mode="slider"
      :track-active="Boolean(entity.on)"
      :track-pct="entity.fanSpeedPct ?? 0"
      track-fill-class="bg-gradient-to-r from-[#2D6880]/65 to-[#73B7B2]/45"
      @icon="toggleIcon(entity)"
      @main="onMain"
    />

    <EmbeddedSlider
      v-if="span.r >= 2 && entity.expandedContent.secondarySlider"
      label="Prędkość turbiny nawiewu"
      :value="entity.fanSpeedPct ?? 0"
      fill-class="bg-gradient-to-r from-[#2D6880]/80 to-[#73B7B2]/70"
      @update:value="onFanSpeed"
    />
  </TileFrame>
</template>
