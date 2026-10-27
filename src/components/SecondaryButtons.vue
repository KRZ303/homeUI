<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Entity, SecondaryButton } from '../types'
import { toggleSecondaryButton } from '../stores/home'
import AppIcon from './icons/AppIcon.vue'

const props = defineProps<{
  entity: Entity
  c: number
  r: number
}>()

const buttons = computed(() => props.entity.secondaryButtons ?? [])
const visible = computed(() => props.r >= 2 && buttons.value.length > 0)
const asSliders = computed(
  () =>
    props.c >= 4 &&
    props.entity.type === 'slider_light' &&
    buttons.value.some((button) => button.type !== 'ghost_momentary'),
)

const flashId = ref<string | null>(null)
let flashTimer: number | undefined

function onPillClick(button: SecondaryButton): void {
  if (button.type === 'ghost_momentary') {
    flashId.value = button.id
    window.clearTimeout(flashTimer)
    flashTimer = window.setTimeout(() => {
      flashId.value = null
    }, 650)
    return
  }
  toggleSecondaryButton(props.entity, button)
}

function pillClass(button: SecondaryButton): string {
  if (button.type === 'ghost_momentary') {
    return flashId.value === button.id
      ? 'bg-[#73B7B2] text-[#182C2A]'
      : 'bg-white/[0.03] text-white/90 hover:bg-white/[0.08]'
  }
  return button.active
    ? 'bg-[#73B7B2] text-[#182C2A] shadow-sm'
    : 'bg-black/25 text-white/90 hover:bg-black/35'
}

const dragging = ref<string | null>(null)
const moved = ref(false)
let startX = 0
let pointerId: number | null = null

function sliderFill(button: SecondaryButton): string {
  const value = button.active ? (button.brightness ?? 0) : 0
  return `calc((100% - 8px) * ${Math.max(0, Math.min(100, value)) / 100})`
}

function onSliderDown(event: PointerEvent, button: SecondaryButton): void {
  event.stopPropagation()
  if (event.pointerType === 'mouse' && event.button !== 0) return
  dragging.value = button.id
  moved.value = false
  startX = event.clientX
  pointerId = event.pointerId
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onSliderMove(event: PointerEvent, button: SecondaryButton): void {
  if (dragging.value !== button.id || event.pointerId !== pointerId) return
  const dx = event.clientX - startX
  if (!moved.value && Math.abs(dx) > 5) moved.value = true
  if (!moved.value) return
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const pct = ((event.clientX - rect.left) / rect.width) * 100
  button.brightness = Math.round(Math.max(1, Math.min(100, pct)))
  button.active = true
  if (event.cancelable) event.preventDefault()
}

function onSliderUp(event: PointerEvent, button: SecondaryButton): void {
  if (dragging.value !== button.id) return
  const host = event.currentTarget as HTMLElement
  if (pointerId !== null && host.hasPointerCapture(pointerId)) host.releasePointerCapture(pointerId)
  const wasMoved = moved.value
  dragging.value = null
  pointerId = null
  moved.value = false
  if (!wasMoved) toggleSecondaryButton(props.entity, button)
}
</script>

<template>
  <div
    v-if="visible"
    class="mt-auto pt-2.5"
    :class="buttons.length === 1 ? 'flex' : 'grid grid-cols-2 gap-2.5'"
  >
    <template v-if="asSliders">
      <div
        v-for="button in buttons"
        :key="button.id"
        class="relative h-[44px] cursor-ew-resize overflow-hidden rounded-full bg-black/35 p-1 ets-no-select"
        data-no-tile
        @pointerdown="onSliderDown($event, button)"
        @pointermove="onSliderMove($event, button)"
        @pointerup="onSliderUp($event, button)"
        @pointercancel="dragging = null"
      >
        <div
          class="absolute bottom-1 left-1 top-1 rounded-full bg-[#73B7B2]/85 transition-[width] duration-100"
          :style="{ width: sliderFill(button) }"
        />
        <div class="relative z-10 flex h-full items-center justify-between gap-1 px-2.5">
          <span class="flex min-w-0 items-center gap-1.5 text-[12px] font-semibold text-white">
            <AppIcon :name="button.icon" :type="button.iconType" :size="14" class="shrink-0" />
            <span class="truncate">{{ button.label }}</span>
          </span>
          <span class="shrink-0 text-[11px] font-bold tabular-nums text-white/85">
            {{ button.active ? button.brightness ?? 0 : 0 }}%
          </span>
        </div>
      </div>
    </template>

    <template v-else>
      <button
        v-for="button in buttons"
        :key="button.id"
        type="button"
        data-no-tile
        class="flex h-[42px] items-center rounded-full text-[13px] font-semibold transition-all active:scale-[0.98]"
        :class="[
          pillClass(button),
          props.c >= 4 ? 'gap-2 px-4' : 'gap-1.5 px-2',
          buttons.length === 1 ? 'ml-auto min-w-[148px]' : '',
          button.type === 'ghost_momentary' ? 'ml-auto min-w-[148px] justify-end' : '',
        ]"
        :title="button.label"
        :aria-label="button.label"
        @pointerdown.stop
        @click.stop="onPillClick(button)"
      >
        <template v-if="button.type === 'ghost_momentary'">
          <span class="truncate">{{ button.label }}</span>
          <AppIcon :name="button.icon" :type="button.iconType" :size="16" class="shrink-0" />
        </template>
        <template v-else>
          <AppIcon :name="button.icon" :type="button.iconType" :size="16" class="shrink-0" />
          <span class="truncate">{{ button.label }}</span>
        </template>
      </button>
    </template>
  </div>
</template>
