<script setup lang="ts">
import { computed, ref } from 'vue'
import { clamp } from '../utils/format'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    min?: number
    max?: number
    unit?: string
    fillClass?: string
    formatValue?: (value: number) => string
  }>(),
  {
    min: 0,
    max: 100,
    unit: '%',
    fillClass: 'bg-[#73B7B2]/80',
    formatValue: undefined,
  },
)

const emit = defineEmits<{
  (event: 'update:value', value: number): void
}>()

const dragging = ref(false)
const moved = ref(false)
let startX = 0
let pointerId: number | null = null
let rectLeft = 0
let rectWidth = 1

const pct = computed(() => {
  const range = props.max - props.min
  if (range <= 0) return 0
  return ((props.value - props.min) / range) * 100
})

const display = computed(() =>
  props.formatValue ? props.formatValue(props.value) : `${Math.round(props.value)}${props.unit}`,
)

function emitFromClientX(clientX: number): void {
  const ratio = clamp((clientX - rectLeft) / rectWidth, 0, 1)
  emit('update:value', Math.round(props.min + ratio * (props.max - props.min)))
}

function onPointerDown(event: PointerEvent): void {
  event.stopPropagation()
  if (event.pointerType === 'mouse' && event.button !== 0) return
  const host = event.currentTarget as HTMLElement
  const rect = host.getBoundingClientRect()
  rectLeft = rect.left
  rectWidth = rect.width
  dragging.value = true
  moved.value = false
  startX = event.clientX
  pointerId = event.pointerId
  host.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value || event.pointerId !== pointerId) return
  if (!moved.value && Math.abs(event.clientX - startX) > 4) moved.value = true
  if (!moved.value) return
  emitFromClientX(event.clientX)
  if (event.cancelable) event.preventDefault()
}

function onPointerUp(event: PointerEvent): void {
  if (!dragging.value) return
  const host = event.currentTarget as HTMLElement
  if (pointerId !== null && host.hasPointerCapture(pointerId)) host.releasePointerCapture(pointerId)
  if (!moved.value) emitFromClientX(event.clientX)
  dragging.value = false
  pointerId = null
  moved.value = false
}
</script>

<template>
  <div class="mt-auto pt-2.5" data-no-tile @pointerdown.stop>
    <div class="mb-1.5 flex items-center justify-between px-1 text-[10px] font-medium text-white/55">
      <span class="truncate">{{ label }}</span>
      <span class="shrink-0 tabular-nums text-white/80">{{ display }}</span>
    </div>
    <div
      class="relative h-9 cursor-ew-resize overflow-hidden rounded-full bg-black/35 p-1"
      data-no-tile
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="dragging = false"
    >
      <div
        class="h-full rounded-full transition-[width] duration-100"
        :class="fillClass"
        :style="{ width: `${clamp(pct, 0, 100)}%` }"
      />
      <div
        v-if="dragging"
        class="absolute right-2 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-white/45"
      />
    </div>
  </div>
</template>
