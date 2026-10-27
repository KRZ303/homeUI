<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import SecondaryButtons from '../SecondaryButtons.vue'
import EmbeddedSlider from '../EmbeddedSlider.vue'
import { effectiveSpan } from '../../utils/tile'
import { setBrightness, toggleIcon, toggleMainButton } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))

const iconClass = computed(() =>
  entity.on
    ? 'bg-amber-400/35 text-amber-200'
    : 'bg-white/[0.09] text-white/70 hover:bg-white/[0.15]',
)

function onMain(button: MainButton): void {
  const preset = /(\d{4})\s*K/.test(button.label) || /%/.test(button.label) || /Noc/.test(button.label)
  toggleMainButton(entity, button)
  if (preset) {
    entity.mainButtons?.forEach((candidate) => {
      candidate.active = candidate.id === button.id
    })
  }
  const percent = button.label.match(/(\d+)\s*%/)
  if (percent) setBrightness(entity, Number(percent[1]))
  const kelvin = button.label.match(/(\d{4})\s*K/)
  if (kelvin) entity.colorTemp = Number(kelvin[1])
  if (/Noc/.test(button.label)) setBrightness(entity, 20)
  if (/Czytanie/i.test(button.label)) setBrightness(entity, 70)
}

function onColorTemp(value: number): void {
  entity.colorTemp = value
}
</script>

<template>
  <TileFrame
    :entity="entity"
    drag-mode="horizontal"
    surface-class="bg-[#303030]"
    @slide="setBrightness(entity, $event)"
  >
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      track-mode="slider"
      :track-active="Boolean(entity.on)"
      :track-pct="entity.brightness ?? 0"
      track-fill-class="bg-gradient-to-r from-amber-500/45 to-amber-400/35"
      @icon="toggleIcon(entity)"
      @main="onMain"
    />

    <SecondaryButtons
      v-if="span.r >= 2 && entity.expandedContent.secondaryButtons"
      :entity="entity"
      :c="span.c"
      :r="span.r"
    />

    <EmbeddedSlider
      v-if="span.r >= 3 && entity.colorTemp !== undefined && entity.expandedContent.secondarySlider"
      label="Temperatura barwowa"
      :value="entity.colorTemp"
      :min="2200"
      :max="6000"
      :format-value="(value: number) => `${Math.round(value)} K`"
      fill-class="bg-gradient-to-r from-orange-400/80 to-amber-200/80"
      @update:value="onColorTemp"
    />
  </TileFrame>
</template>
