<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import EmbeddedSlider from '../EmbeddedSlider.vue'
import AppIcon from '../icons/AppIcon.vue'
import { effectiveSpan, verticalFillHeight } from '../../utils/tile'
import { setBlind, toggleIcon, toggleMainButton } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))

const iconClass = computed(() =>
  (entity.position ?? 0) > 0
    ? 'bg-[#73B7B2] text-[#182C2A]'
    : 'bg-white/[0.1] text-white/75',
)

const position = computed(() => entity.position ?? 0)

const controls = [
  { label: 'Otwórz 100%', icon: 'ArrowUp', value: 100 },
  { label: 'Stop / 50%', icon: 'Pause', value: 50 },
  { label: 'Zamknij 0%', icon: 'ArrowDown', value: 0 },
]

function applyPosition(value: number): void {
  setBlind(entity, value)
}

function onMain(button: MainButton): void {
  toggleMainButton(entity, button)
  entity.mainButtons?.forEach((candidate) => {
    candidate.active = candidate.id === button.id
  })
  if (/45/.test(button.label)) entity.tilt = 45
  if (/0°/.test(button.label)) {
    entity.tilt = 0
    setBlind(entity, 0)
  }
}

function onTilt(value: number): void {
  entity.tilt = value
}
</script>

<template>
  <TileFrame
    :entity="entity"
    drag-mode="vertical"
    surface-class="bg-[#303030]"
    @slide="setBlind(entity, $event)"
  >
    <div
      data-track
      class="pointer-events-none absolute bottom-2 left-2 top-2 w-[52px] overflow-hidden rounded-full bg-black/30"
    >
      <div
        class="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-[#3B6E6C]/80 to-[#73B7B2]/55 transition-all duration-100"
        :style="{ height: verticalFillHeight(position, position > 0) }"
      />
      <div
        v-if="position > 0"
        class="absolute bottom-2.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-white/50"
      />
    </div>

    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      track-mode="none"
      @icon="toggleIcon(entity)"
      @main="onMain"
    />

    <div class="mt-auto flex flex-col gap-2 pb-0.5 pl-[54px] pt-2.5">
      <button
        v-for="control in controls"
        :key="control.label"
        type="button"
        data-no-tile
        class="flex h-9 items-center justify-between gap-2 rounded-full bg-black/25 px-3 text-xs font-semibold text-white/90 transition-colors hover:bg-black/35 active:scale-[0.99]"
        @pointerdown.stop
        @click.stop="applyPosition(control.value)"
      >
        <span class="truncate">{{ control.label }}</span>
        <AppIcon :name="control.icon" :size="15" class="shrink-0 text-white/70" />
      </button>

      <EmbeddedSlider
        v-if="span.c >= 4 && entity.expandedContent.secondarySlider"
        label="Kąt nachylenia lameli"
        :value="entity.tilt ?? 0"
        :min="0"
        :max="90"
        :format-value="(value: number) => `${Math.round(value)}°`"
        fill-class="bg-gradient-to-r from-[#3B6E6C]/80 to-[#73B7B2]/70"
        @update:value="onTilt"
      />
    </div>
  </TileFrame>
</template>
