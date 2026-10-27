<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import AppIcon from '../icons/AppIcon.vue'
import { effectiveSpan } from '../../utils/tile'
import { dishwasherAction, toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))
const isEv = computed(() => entity.iconName === 'ev-car')
const running = computed(() => entity.state === 'running' || entity.state === 'paused')

const iconName = computed(() => (isEv.value ? 'Car' : (entity.iconName ?? 'door-closed')))

const DELAY_OPTIONS = ['0:00', '1:00', '2:00', '4:00']
const PROGRAMME_OPTIONS = ['Intensywny 70°C', 'Auto 45-65°C', 'Eco 50°C', 'Szybki 45°C']
const EV_PROGRAMMES = ['Tylko Słońce PV + V2H • 11 kW', 'Tania Taryfa 2:00 • 11 kW', 'V2H Export 11 kW']

const buttons = computed<MainButton[]>(() => {
  if (!running.value) {
    return [
      {
        id: 'delay',
        label: `Start za ${entity.delay ?? '0:00'}`,
        icon: 'Clock',
        active: false,
        showLabel: true,
      },
      { id: 'start', label: 'Start!', icon: 'Play', active: true, showLabel: true },
    ]
  }
  return [
    {
      id: 'pause',
      label: entity.state === 'paused' ? 'Wznów' : 'Pauza',
      icon: entity.state === 'paused' ? 'Play' : 'Pause',
      active: true,
      showLabel: true,
    },
    { id: 'stop', label: 'Zakończ', icon: 'Square', active: false, showLabel: true },
  ]
})

const modifiers = computed(() => {
  const labels = isEv.value
    ? ['Solar PV', 'V2H 11kW', 'Limit 80%']
    : ['Clean+', 'Speed+', 'Dry+']
  return [
    { id: 'clean', label: labels[0], icon: 'Sparkles', active: Boolean(entity.cleanPlus) },
    { id: 'speed', label: labels[1], icon: 'Clock', active: Boolean(entity.speedPlus) },
    { id: 'dry', label: labels[2], icon: 'Wind', active: Boolean(entity.dryPlus) },
  ]
})

function onMain(button: MainButton): void {
  dishwasherAction(entity, button.id)
}

function cycleProgramme(): void {
  const list = isEv.value ? EV_PROGRAMMES : PROGRAMME_OPTIONS
  const current = list.indexOf(entity.programme ?? '')
  entity.programme = list[(current + 1) % list.length]
}

function toggleModifier(id: string): void {
  if (id === 'clean') entity.cleanPlus = !entity.cleanPlus
  if (id === 'speed') entity.speedPlus = !entity.speedPlus
  if (id === 'dry') entity.dryPlus = !entity.dryPlus
}
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none" surface-class="bg-[#303030]">
    <TileTopRow
      :entity="entity"
      :icon-name="iconName"
      :buttons="buttons"
      :on-button="onMain"
      @icon="toggleIcon(entity)"
    />

    <div
      v-if="span.r >= 2"
      class="mt-auto flex items-center gap-2 pt-2.5"
      data-no-tile
      @pointerdown.stop
      @click.stop
    >
      <button
        type="button"
        class="flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-full bg-black/25 px-3 text-[11px] font-semibold text-teal-200 transition-colors hover:bg-black/40"
        @click.stop="cycleProgramme"
      >
        <span class="truncate">{{ entity.programme }}</span>
        <ChevronDown :size="13" class="ml-auto shrink-0 text-teal-200/70" />
      </button>

      <div class="flex shrink-0 items-center gap-1.5">
        <button
          v-for="modifier in modifiers"
          :key="modifier.id"
          type="button"
          class="flex h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium transition-colors"
          :class="
            modifier.active
              ? 'bg-[#73B7B2] text-[#1A2E2C]'
              : 'bg-white/[0.05] text-white hover:bg-white/[0.1]'
          "
          @click.stop="toggleModifier(modifier.id)"
        >
          <AppIcon :name="modifier.icon" :size="12" class="shrink-0" />
          <span>{{ modifier.label }}</span>
        </button>
      </div>
    </div>
  </TileFrame>
</template>
