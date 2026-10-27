<script setup lang="ts">
import { computed } from 'vue'
import { clamp } from '../utils/format'
import AppIcon from './icons/AppIcon.vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    min?: number
    max?: number
    suffix?: string
    icon?: string
    fillClass?: string
  }>(),
  { min: 0, max: 100, suffix: '%', icon: undefined, fillClass: 'rgba(115, 183, 178, 0.85)' },
)

const emit = defineEmits<{ (event: 'update', value: number): void }>()

const pct = computed(() => ((props.value - props.min) / (props.max - props.min)) * 100)

function onPointerDown(event: PointerEvent): void {
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  update(event)
}

function update(event: PointerEvent): void {
  if (event.pointerType === 'mouse' && !(event.buttons & 1)) return
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1)
  emit('update', Math.round(props.min + ratio * (props.max - props.min)))
}
</script>

<template>
  <div
    class="relative flex h-9 cursor-ew-resize items-center overflow-hidden rounded-full bg-black/35 p-1"
    data-no-tile
    @pointerdown.stop="onPointerDown"
    @pointermove.stop="update"
    @click.stop
  >
    <div
      class="absolute inset-y-1 left-1 rounded-full transition-all duration-100"
      :style="{ background: fillClass, width: `calc((100% - 8px) * ${pct / 100})` }"
    ></div>
    <div class="relative z-10 flex w-full items-center justify-between px-3">
      <span class="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-white/90">
        <AppIcon v-if="icon" :name="icon" :size="12" class="shrink-0 opacity-70" />
        <span class="truncate">{{ label }}</span>
      </span>
      <span class="shrink-0 text-[11px] font-semibold tabular-nums text-white/85">
        {{ value }}{{ suffix }}
      </span>
    </div>
  </div>
</template>
