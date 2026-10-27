<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { decimalComma } from '../../utils/format'
import { effectiveSpan } from '../../utils/tile'
import {
  acceptSuggestion,
  thermostatPreset,
  thermostatStep,
  toggleIcon,
} from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))

const PRESETS = [
  { name: 'Eco', label: 'Eco 19°C', temp: 19 },
  { name: 'Komfort', label: 'Komfort 22°C', temp: 22 },
  { name: 'Boost', label: 'Boost 25°C', temp: 25 },
]

const buttons = computed<MainButton[]>(() => {
  const list: MainButton[] = [
    { id: 'minus', label: 'Obniż (-0,5°C)', icon: 'Minus', active: false },
    { id: 'plus', label: 'Podwyższ (+0,5°C)', icon: 'Plus', active: false },
  ]
  if (entity.matterSuggestion?.active) {
    list.push({
      id: 'suggestion',
      label: `Sugestia ${decimalComma(entity.matterSuggestion.suggestedTemp)}°C`,
      icon: 'Sparkles',
      active: true,
    })
  }
  return list
})

function onMain(button: MainButton): void {
  if (button.id === 'minus') thermostatStep(entity, -0.5)
  else if (button.id === 'plus') thermostatStep(entity, 0.5)
  else if (button.id === 'suggestion') acceptSuggestion(entity)
}
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none">
    <TileTopRow :entity="entity" :buttons="buttons" :on-button="onMain" @icon="toggleIcon(entity)" />

    <div
      v-if="span.r >= 2 && entity.expandedContent.presets"
      class="mt-auto flex flex-col gap-2 pt-2.5"
      data-no-tile
      @pointerdown.stop
      @click.stop
    >
      <div
        v-if="entity.matterSuggestion?.active"
        class="flex items-center gap-2 rounded-2xl bg-white/[0.05] px-3 py-2"
      >
        <Sparkles :size="14" class="shrink-0 text-[#73B7B2]" />
        <span class="min-w-0 flex-1 truncate text-[11px] text-white/85">
          Matter 1.6: {{ entity.matterSuggestion.source }}
          ({{ decimalComma(entity.matterSuggestion.suggestedTemp) }}°C)
        </span>
        <button
          type="button"
          class="shrink-0 rounded-full bg-[#73B7B2] px-3 py-1 text-[11px] font-semibold text-[#182C2A] transition-transform active:scale-95"
          @click.stop="acceptSuggestion(entity)"
        >
          Przyjmij
        </button>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="preset in PRESETS"
          :key="preset.name"
          type="button"
          class="h-9 truncate rounded-full text-[11px] font-semibold transition-colors"
          :class="
            entity.preset === preset.name
              ? 'bg-[#73B7B2] text-[#182C2A]'
              : 'bg-black/25 text-white/80 hover:bg-black/35'
          "
          @click.stop="thermostatPreset(entity, preset.name, preset.temp)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>
  </TileFrame>
</template>
