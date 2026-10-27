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

function onMain(button: MainButton): void {
  toggleMainButton(entity, button.id)
  const isPreset =
    /\d{4}\s*K/.test(button.label) ||
    /%/.test(button.label) ||
    /Noc/.test(button.label) ||
    /Czytanie/i.test(button.label) ||
    /Blat/i.test(button.label)
  if (isPreset) {
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
    <TileTopRow :entity="entity" :on-button="onMain" @icon="toggleIcon(entity)" />

    <SecondaryButtons
      v-if="span.r >= 2 && entity.expandedContent.secondaryButtons"
      :entity="entity"
    />

    <EmbeddedSlider
      v-if="
        span.r >= 3 && entity.colorTemp !== undefined && entity.expandedContent.secondarySlider
      "
      label="Temperatura barwowa"
      :value="entity.colorTemp"
      :min="2200"
      :max="6000"
      suffix=" K"
      fill-class="bg-gradient-to-r from-orange-400/80 to-amber-200/80"
      @update="onColorTemp"
    />
  </TileFrame>
</template>
