<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { effectiveSpan } from '../../utils/tile'
import { fixedPL } from '../../utils/format'
import { toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))
const heating = computed(() => (entity.demand ?? 0) > 0)

const iconClass = computed(() =>
  heating.value
    ? 'bg-amber-500/35 text-amber-200'
    : 'bg-white/[0.08] text-white/65',
)

const suggestion = computed(() => entity.matterSuggestion)

const buttons = computed<MainButton[]>(() => {
  const list: MainButton[] = [
    { id: 'minus', label: 'Obniż (-0,5°C)', icon: 'Minus', active: false },
    { id: 'plus', label: 'Podwyższ (+0,5°C)', icon: 'Plus', active: false },
  ]
  if (suggestion.value) {
    list.push({
      id: 'suggest',
      label: `Sugestia ${fixedPL(suggestion.value.suggestedTemp)}°C`,
      icon: 'Sparkles',
      active: suggestion.value.active,
      showLabel: true,
    })
  }
  return list
})

const presets = [
  { label: 'Eco 19°C', temp: 19 },
  { label: 'Komfort 22°C', temp: 22 },
  { label: 'Boost 25°C', temp: 25 },
]

function onMain(button: MainButton): void {
  if (button.id === 'minus') {
    entity.targetTemp = Math.max(5, (entity.targetTemp ?? 20) - 0.5)
    return
  }
  if (button.id === 'plus') {
    entity.targetTemp = Math.min(35, (entity.targetTemp ?? 20) + 0.5)
    return
  }
  if (button.id === 'suggest' && suggestion.value) {
    entity.targetTemp = suggestion.value.suggestedTemp
    suggestion.value.active = true
    entity.demand = 55
  }
}

function acceptSuggestion(): void {
  if (!suggestion.value) return
  entity.targetTemp = suggestion.value.suggestedTemp
  suggestion.value.active = true
  entity.demand = 55
}

function applyPreset(temp: number): void {
  entity.targetTemp = temp
}
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none" surface-class="bg-[#303030]">
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      :buttons="buttons"
      track-mode="progress"
      :track-active="heating"
      :track-pct="entity.demand ?? 0"
      track-fill-class="bg-[#9E5231]/75"
      @icon="toggleIcon(entity)"
      @main="onMain"
    />

    <div
      v-if="span.r >= 2 && entity.expandedContent.presets"
      class="mt-auto flex flex-col gap-2 pt-2.5"
    >
      <div
        v-if="suggestion"
        class="flex items-center justify-between gap-2 rounded-full bg-black/25 px-3 py-1.5 text-[10px] text-white/75"
      >
        <span class="truncate">
          Matter 1.6: {{ suggestion.source }} ({{ fixedPL(suggestion.suggestedTemp) }}°C)
        </span>
        <button
          type="button"
          data-no-tile
          class="shrink-0 rounded-full bg-[#73B7B2] px-2.5 py-1 text-[10px] font-bold text-[#182C2A]"
          @pointerdown.stop
          @click.stop="acceptSuggestion"
        >
          Przyjmij
        </button>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="preset in presets"
          :key="preset.label"
          type="button"
          data-no-tile
          class="h-8 rounded-full px-1 text-[10px] font-semibold transition-colors active:scale-[0.98]"
          :class="
            Math.abs((entity.targetTemp ?? 0) - preset.temp) < 0.01
              ? 'bg-[#73B7B2] text-[#182C2A]'
              : 'bg-black/25 text-white/80 hover:bg-black/35'
          "
          @pointerdown.stop
          @click.stop="applyPreset(preset.temp)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>
  </TileFrame>
</template>
