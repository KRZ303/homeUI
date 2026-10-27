<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import EmbeddedSlider from '../EmbeddedSlider.vue'
import { effectiveSpan } from '../../utils/tile'
import { setVolume, toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))
const SOURCES = ['Netflix • 4K', 'PS5', 'Matter Cast']

const iconClass = computed(() =>
  entity.on
    ? 'bg-[#73B7B2] text-[#182C2A]'
    : 'bg-white/[0.09] text-white/65',
)

const buttons = computed<MainButton[]>(() => [
  {
    id: 'source',
    label: entity.source ?? 'Netflix • 4K',
    icon: 'Tv',
    active: Boolean(entity.on),
    showLabel: true,
  },
  {
    id: 'pause',
    label: entity.playing ? 'Pauza' : 'Odtwarzaj',
    icon: entity.playing ? 'Pause' : 'Play',
    active: Boolean(entity.playing && entity.on),
  },
  {
    id: 'power',
    label: 'Zasilanie',
    icon: 'Power',
    active: Boolean(entity.on),
    activeClass: 'bg-rose-500/35 text-rose-100 border border-rose-400/30',
  },
])

function onMain(button: MainButton): void {
  if (button.id === 'source') {
    const index = SOURCES.indexOf(entity.source ?? SOURCES[0])
    entity.source = SOURCES[(index + 1) % SOURCES.length]
    entity.on = true
    return
  }
  if (button.id === 'pause') {
    entity.playing = !entity.playing
    if (entity.playing) entity.on = true
    return
  }
  if (button.id === 'power') {
    entity.on = !entity.on
    if (!entity.on) entity.playing = false
  }
}

function onVolume(value: number): void {
  setVolume(entity, value)
}
</script>

<template>
  <TileFrame
    :entity="entity"
    drag-mode="horizontal"
    surface-class="bg-[#303030]"
    @slide="setVolume(entity, $event)"
  >
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      :buttons="buttons"
      track-mode="slider"
      :track-active="Boolean(entity.on)"
      :track-pct="entity.volume ?? 0"
      track-fill-class="bg-gradient-to-r from-indigo-500/45 to-[#73B7B2]/45"
      @icon="toggleIcon(entity)"
      @main="onMain"
    />

    <EmbeddedSlider
      v-if="span.r >= 2 && entity.expandedContent.secondarySlider"
      label="Głośność amplitunera"
      :value="entity.volume ?? 0"
      fill-class="bg-gradient-to-r from-indigo-500/80 to-[#73B7B2]/70"
      @update:value="onVolume"
    />
  </TileFrame>
</template>
