<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Entity, SecondaryButton } from '../types'
import { effectiveSpan } from '../utils/tile'
import { setSecondaryBrightness, toggleSecondaryButton } from '../stores/home'
import AppIcon from './icons/AppIcon.vue'

const props = defineProps<{ entity: Entity }>()

const span = computed(() => effectiveSpan(props.entity))
const buttons = computed(() => props.entity.secondaryButtons ?? [])
const morphToSliders = computed(() => span.value.c >= 4 && props.entity.type === 'slider_light')
const flashingId = ref<string | null>(null)
let flashTimer: number | undefined

function toggle(button: SecondaryButton): void {
  if (button.type === 'ghost_momentary') {
    flashingId.value = button.id
    window.clearTimeout(flashTimer)
    flashTimer = window.setTimeout(() => {
      flashingId.value = null
    }, 650)
  }
  toggleSecondaryButton(props.entity, button.id)
}

function pillClass(button: SecondaryButton): string {
  const base =
    button.type === 'ghost_momentary'
      ? 'bg-white/[0.03] hover:bg-white/[0.08] text-white/90'
      : button.active
        ? 'bg-[#73B7B2] text-[#182C2A] shadow-sm'
        : 'bg-black/25 hover:bg-black/35 text-white/90'
  if (flashingId.value === button.id) return 'bg-[#73B7B2] text-[#182C2A]'
  return base
}

// --- Sideways-expanded morph into independent sub-sliders (C ≥ 4) ---
function sliderValue(button: SecondaryButton): number {
  return button.brightness ?? 0
}

function onSliderPointer(event: PointerEvent, button: SecondaryButton): void {
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  updateSlider(event, button)
}

function updateSlider(event: PointerEvent, button: SecondaryButton): void {
  if (event.pointerType === 'mouse' && !(event.buttons & 1)) return
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const pct = ((event.clientX - rect.left) / rect.width) * 100
  setSecondaryBrightness(props.entity, button.id, Math.max(1, Math.min(100, pct)))
}
</script>

<template>
  <div
    v-if="span.r >= 2 && buttons.length"
    class="mt-auto flex flex-col gap-2 pt-2.5"
    data-no-tile
    @pointerdown.stop
    @click.stop
  >
    <!-- C ≥ 4: oval pills morph into horizontally draggable secondary sliders -->
    <div v-if="morphToSliders" class="flex flex-col gap-2">
      <div
        v-for="button in buttons.filter((b) => b.type !== 'ghost_momentary')"
        :key="button.id"
        class="relative flex h-[44px] cursor-ew-resize items-center overflow-hidden rounded-full bg-black/35 p-1"
        @pointerdown="onSliderPointer($event, button)"
        @pointermove="updateSlider($event, button)"
      >
        <div
          class="absolute inset-y-1 left-1 rounded-full transition-all duration-100"
          style="background: rgba(115, 183, 178, 0.85)"
          :style="{ width: `calc((100% - 8px) * ${sliderValue(button) / 100})` }"
        ></div>
        <div class="relative z-10 flex w-full items-center justify-between px-3">
          <span class="flex items-center gap-2 text-[13px] font-semibold text-white">
            <AppIcon :name="button.icon" :icon-type="button.iconType" :size="14" class="opacity-80" />
            {{ button.label }}
          </span>
          <span class="text-xs font-semibold tabular-nums text-white/85">
            {{ sliderValue(button) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Standard / momentary secondary pills -->
    <div
      v-else
      class="grid gap-2"
      :class="buttons.length === 1 ? '' : 'grid-cols-2 gap-2.5'"
    >
      <button
        v-for="button in buttons"
        :key="button.id"
        type="button"
        class="flex h-[42px] items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors"
        :class="[
          pillClass(button),
          button.type === 'ghost_momentary' || buttons.length === 1 ? 'ml-auto min-w-[148px]' : '',
        ]"
        @click.stop="toggle(button)"
      >
        <AppIcon
          v-if="button.type !== 'ghost_momentary'"
          :name="button.icon"
          :icon-type="button.iconType"
          :size="15"
          class="shrink-0"
        />
        <span class="min-w-0 flex-1 truncate text-left">{{ button.label }}</span>
        <AppIcon
          v-if="button.type === 'ghost_momentary'"
          :name="button.icon"
          :icon-type="button.iconType"
          :size="15"
          class="shrink-0"
        />
      </button>
    </div>
  </div>
</template>
