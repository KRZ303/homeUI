<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import EmbeddedSlider from '../EmbeddedSlider.vue'
import { effectiveSpan } from '../../utils/tile'
import { setVolume, toggleIcon, tvAction } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))

const buttons = computed<MainButton[]>(() => [
  {
    id: 'source',
    label: entity.source ?? 'Netflix • 4K',
    icon: 'Tv',
    active: Boolean(entity.on),
    showLabel: true,
  },
  {
    id: 'play',
    label: entity.playing ? 'Pauza' : 'Odtwarzaj',
    icon: entity.playing ? 'Pause' : 'Play',
    active: Boolean(entity.on && entity.playing),
    showLabel: true,
  },
  {
    id: 'power',
    label: 'Zasilanie',
    icon: 'Power',
    active: Boolean(entity.on),
    activeClass: 'bg-rose-500/35 text-rose-100',
    showLabel: true,
  },
])

function onMain(button: MainButton): void {
  tvAction(entity, button.id)
}
</script>

<template>
  <TileFrame
    :entity="entity"
    drag-mode="horizontal"
    surface-class="bg-[#303030]"
    @slide="setVolume(entity, $event)"
  >
    <TileTopRow :entity="entity" :buttons="buttons" :on-button="onMain" @icon="toggleIcon(entity)" />

    <EmbeddedSlider
      v-if="span.r >= 2 && entity.expandedContent.secondarySlider"
      class="mt-auto pt-2.5"
      label="Głośność amplitunera"
      :value="entity.volume ?? 0"
      @update="setVolume(entity, $event)"
    />
  </TileFrame>
</template>
