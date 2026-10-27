<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DragMode, Entity, ExpandDirection } from '../types'
import {
  effectiveSpan,
  minHeightForRows,
  subtitleFor,
  surfaceClassFor,
} from '../utils/tile'
import { cycleSpan, home, openModal, toggleIcon } from '../stores/home'
import AppIcon from './icons/AppIcon.vue'

const props = withDefaults(
  defineProps<{
    entity: Entity
    dragMode?: DragMode
    surfaceClass?: string
  }>(),
  { dragMode: 'none', surfaceClass: undefined },
)

const emit = defineEmits<{
  (event: 'slide', value: number): void
}>()

const root = ref<HTMLElement | null>(null)
const span = computed(() => effectiveSpan(props.entity))
const pointerActive = ref(false)
const moved = ref(false)
let startX = 0
let startY = 0
let pointerId: number | null = null

const surface = computed(() => props.surfaceClass ?? surfaceClassFor(props.entity))

const frameStyle = computed(() => ({
  gridColumn: `span ${span.value.c} / span ${span.value.c}`,
  gridRow: `span ${span.value.r} / span ${span.value.r}`,
  minHeight: minHeightForRows(span.value.r),
  touchAction:
    props.dragMode === 'horizontal' ? 'pan-y' : props.dragMode === 'vertical' ? 'pan-x' : 'auto',
}))

const showExpanders = computed(
  () =>
    props.entity.expanders.down ||
    props.entity.expanders.right ||
    props.entity.expanders.diagonal,
)
const downActive = computed(() => span.value.r > props.entity.defaultSpan.r)
const rightActive = computed(() => span.value.c > props.entity.defaultSpan.c)
const diagonalActive = computed(
  () => span.value.c !== props.entity.defaultSpan.c || span.value.r !== props.entity.defaultSpan.r,
)

const nestedEntities = computed(() =>
  (props.entity.nestedTiles ?? [])
    .map((id) => home.entities[id])
    .filter((candidate): candidate is Entity => Boolean(candidate)),
)

const showNested = computed(
  () =>
    nestedEntities.value.length > 0 &&
    span.value.r >= 2 &&
    (span.value.c > props.entity.defaultSpan.c || span.value.r > props.entity.defaultSpan.r),
)

function trackRect(): DOMRect | null {
  const track = root.value?.querySelector<HTMLElement>('[data-track]')
  return track ? track.getBoundingClientRect() : null
}

function onPointerDown(event: PointerEvent): void {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  const target = event.target as HTMLElement | null
  if (target?.closest('[data-no-tile]')) return
  pointerActive.value = true
  moved.value = false
  startX = event.clientX
  startY = event.clientY
  pointerId = event.pointerId
  root.value?.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent): void {
  if (!pointerActive.value || event.pointerId !== pointerId) return
  const dx = event.clientX - startX
  const dy = event.clientY - startY

  if (!moved.value) {
    if (props.dragMode === 'horizontal' && Math.abs(dx) > 6) {
      moved.value = true
      home.tileDragActive = true
    } else if (props.dragMode === 'vertical' && Math.abs(dy) > 5) {
      moved.value = true
      home.tileDragActive = true
    } else if (props.dragMode === 'none' && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      moved.value = true
    }
  }

  if (!moved.value) return

  if (props.dragMode === 'horizontal') {
    const rect = trackRect()
    if (!rect) return
    const pct = ((event.clientX - rect.left) / rect.width) * 100
    emit('slide', Math.max(1, Math.min(100, pct)))
    if (event.cancelable) event.preventDefault()
  } else if (props.dragMode === 'vertical') {
    const rect = trackRect()
    if (!rect) return
    const pct = ((event.clientY - rect.top) / rect.height) * 100
    emit('slide', Math.max(0, Math.min(100, pct)))
    if (event.cancelable) event.preventDefault()
  }
}

function finishPointer(event: PointerEvent): void {
  if (!pointerActive.value) return
  if (pointerId !== null && root.value?.hasPointerCapture(pointerId)) {
    root.value.releasePointerCapture(pointerId)
  }
  pointerActive.value = false
  home.tileDragActive = false
  const wasMoved = moved.value
  moved.value = false
  pointerId = null
  if (!wasMoved) openModal(props.entity.id)
}

function onPointerCancel(): void {
  pointerActive.value = false
  moved.value = false
  pointerId = null
  home.tileDragActive = false
}

function expand(direction: ExpandDirection): void {
  cycleSpan(props.entity, direction)
}
</script>

<template>
  <div
    ref="root"
    class="relative flex h-full flex-col rounded-[30px] p-3 select-none transition-colors duration-300"
    :class="surface"
    :style="frameStyle"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="finishPointer"
    @pointercancel="onPointerCancel"
  >
    <slot />

    <!-- Rule B nested tiles drawer -->
    <div
      v-if="showNested"
      class="relative z-20 mt-2.5 flex flex-col gap-2 border-t border-white/10 pt-2.5"
      @pointerdown.stop
      @click.stop
    >
      <div class="flex items-center justify-between px-1 text-[11px] font-semibold text-[#73B7B2]">
        <span class="flex items-center gap-1">
          <AppIcon name="CornerDownRight" :size="12" />
          Zagnieżdżone kafelki ({{ nestedEntities.length }})
        </span>
      </div>
      <div class="grid grid-cols-4 gap-2">
        <div
          v-for="child in nestedEntities"
          :key="child.id"
          class="col-span-4 flex h-[68px] min-w-0 items-center gap-2.5 rounded-2xl p-2.5"
          :class="surfaceClassFor(child)"
        >
          <button
            type="button"
            data-no-tile
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
            :class="
              child.on || child.active
                ? 'bg-[#73B7B2]/20 text-[#73B7B2]'
                : 'bg-white/[0.08] text-white/70'
            "
            :aria-label="child.title"
            @pointerdown.stop
            @click.stop="toggleIcon(child)"
          >
            <AppIcon :name="child.icon ?? 'Circle'" :icon-type="child.iconType" :size="20" />
          </button>
          <button
            type="button"
            data-no-tile
            class="min-w-0 flex-1 text-left"
            @pointerdown.stop
            @click.stop="openModal(child.id)"
          >
            <div class="truncate text-[13px] font-bold leading-tight text-white">
              {{ child.title }}
            </div>
            <div class="mt-0.5 truncate text-[11px] leading-tight text-white/75 tabular-nums">
              {{ subtitleFor(child) }}
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Opt-in ghost directional expanders -->
    <template v-if="showExpanders">
      <button
        v-if="entity.expanders.down"
        type="button"
        data-no-tile
        class="absolute bottom-0.5 left-1/2 z-30 flex h-5 w-6 -translate-x-1/2 items-center justify-center text-white/25 transition-colors hover:text-white/70"
        aria-label="Rozwiń w dół"
        @pointerdown.stop
        @click.stop="expand('down')"
      >
        <AppIcon
          name="ChevronDown"
          :size="14"
          :class="downActive ? 'rotate-180 text-[#73B7B2]' : ''"
        />
      </button>
      <button
        v-if="entity.expanders.right"
        type="button"
        data-no-tile
        class="absolute right-0.5 top-1/2 z-30 flex h-6 w-5 -translate-y-1/2 items-center justify-center text-white/25 transition-colors hover:text-white/70"
        aria-label="Rozwiń w bok"
        @pointerdown.stop
        @click.stop="expand('right')"
      >
        <AppIcon
          name="ChevronRight"
          :size="14"
          :class="rightActive ? 'rotate-180 text-[#73B7B2]' : ''"
        />
      </button>
      <button
        v-if="entity.expanders.diagonal"
        type="button"
        data-no-tile
        class="absolute bottom-1 right-1.5 z-30 flex h-5 w-5 items-center justify-center text-white/25 transition-colors hover:text-white/70"
        aria-label="Rozwiń ukośnie"
        @pointerdown.stop
        @click.stop="expand('diagonal')"
      >
        <AppIcon
          :name="diagonalActive ? 'ArrowUpLeft' : 'ArrowDownRight'"
          :size="13"
          :class="diagonalActive ? 'text-[#73B7B2]' : ''"
        />
      </button>
    </template>
  </div>
</template>
