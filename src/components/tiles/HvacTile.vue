<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { effectiveSpan } from '../../utils/tile'
import { toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))
const modes = computed(() => entity.modes ?? { cool: false, auto: false, heat: false })

const buttons = computed<MainButton[]>(() => [
  {
    id: 'cool',
    label: 'Chłodzenie',
    icon: 'Snowflake',
    active: modes.value.cool,
    showLabel: true,
    activeClass: 'bg-[#3B82A6] text-white',
  },
  {
    id: 'auto',
    label: 'Auto',
    icon: 'Plug',
    active: modes.value.auto,
    showLabel: true,
    activeClass: 'bg-[#73B7B2] text-[#1A2E2C]',
  },
  {
    id: 'heat',
    label: 'Grzanie',
    icon: 'Flame',
    active: modes.value.heat,
    showLabel: true,
    activeClass: 'bg-[#D96B27] text-[#1E120A]',
  },
])

const anyActive = computed(() => modes.value.cool || modes.value.auto || modes.value.heat)
const iconClass = computed(() =>
  anyActive.value
    ? 'bg-[#73B7B2]/20 text-[#73B7B2]'
    : 'bg-white/[0.09] text-white/70',
)

function onMain(button: MainButton): void {
  if (!entity.modes) return
  if (button.id === 'cool') entity.modes.cool = !entity.modes.cool
  if (button.id === 'auto') entity.modes.auto = !entity.modes.auto
  if (button.id === 'heat') entity.modes.heat = !entity.modes.heat
}
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none" surface-class="bg-[#303030]">
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      :buttons="buttons"
      track-mode="none"
      @icon="toggleIcon(entity)"
      @main="onMain"
    />
  </TileFrame>
</template>
