<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import AmbientTicker from './components/AmbientTicker.vue'
import TileDispatcher from './components/TileDispatcher.vue'
import ControlsBar from './components/ControlsBar.vue'
import ToastStack from './components/ToastStack.vue'
import DeepDiveModal from './components/DeepDiveModal.vue'
import MergeChoiceModal from './components/MergeChoiceModal.vue'
import AppIcon from './components/icons/AppIcon.vue'
import { activeLane, home, modalEntity, setActiveLane, tickAppliances } from './stores/home'

const prevLane = computed(() => home.lanes[home.activeLaneIdx - 1] ?? null)
const nextLane = computed(() => home.lanes[home.activeLaneIdx + 1] ?? null)

const offset = ref(0)
const swiping = ref(false)
const swipe = reactive({
  active: false,
  locked: false,
  pointerId: null as number | null,
  startX: 0,
  startY: 0,
})

const trackStyle = computed(() => {
  const transition = swiping.value ? 'none' : 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)'
  if (home.orientation === 'portrait') {
    return {
      transform: `translate3d(calc(${-home.activeLaneIdx * 100}% + ${offset.value}px), 0, 0)`,
      transition,
    }
  }
  return {
    transform: `translate3d(0, calc(${-home.activeLaneIdx * 100}% + ${offset.value}px), 0)`,
    transition,
  }
})

function detachSwipeListeners(): void {
  window.removeEventListener('pointermove', onWindowMove)
  window.removeEventListener('pointerup', onWindowUp)
  window.removeEventListener('pointercancel', onWindowCancel)
}

function cleanupSwipe(): void {
  detachSwipeListeners()
  swipe.active = false
  swipe.locked = false
  swipe.pointerId = null
  swiping.value = false
  offset.value = 0
}

function onViewportPointerDown(event: PointerEvent): void {
  if (home.modalEntityId || home.pendingMerge) return
  if (event.pointerType === 'mouse' && event.button !== 0) return
  if (swipe.active) return
  const target = event.target as HTMLElement | null
  if (target?.closest('[data-no-swipe]')) return
  swipe.active = true
  swipe.locked = false
  swipe.pointerId = event.pointerId
  swipe.startX = event.clientX
  swipe.startY = event.clientY
  window.addEventListener('pointermove', onWindowMove, { passive: false })
  window.addEventListener('pointerup', onWindowUp)
  window.addEventListener('pointercancel', onWindowCancel)
}

function onWindowMove(event: PointerEvent): void {
  if (!swipe.active || event.pointerId !== swipe.pointerId) return
  if (home.tileDragActive) {
    cleanupSwipe()
    return
  }

  const dx = event.clientX - swipe.startX
  const dy = event.clientY - swipe.startY

  if (!swipe.locked) {
    if (home.orientation === 'portrait') {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        swipe.locked = true
        swiping.value = true
      } else if (Math.abs(dy) > 8) {
        cleanupSwipe()
        return
      }
    } else if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
      swipe.locked = true
      swiping.value = true
    } else if (Math.abs(dx) > 8) {
      cleanupSwipe()
      return
    }
  }

  if (!swipe.locked) return

  let delta = home.orientation === 'portrait' ? dx : dy
  const atStart = home.activeLaneIdx === 0
  const atEnd = home.activeLaneIdx === home.lanes.length - 1
  if ((atStart && delta > 0) || (atEnd && delta < 0)) delta *= 0.25

  offset.value = delta
  if (event.cancelable) event.preventDefault()
}

function onWindowUp(event: PointerEvent): void {
  if (!swipe.active || event.pointerId !== swipe.pointerId) return
  const wasLocked = swipe.locked
  const delta = offset.value
  if (wasLocked) {
    if (delta < -55 && home.activeLaneIdx < home.lanes.length - 1) {
      setActiveLane(home.activeLaneIdx + 1)
    } else if (delta > 55 && home.activeLaneIdx > 0) {
      setActiveLane(home.activeLaneIdx - 1)
    }
  }
  cleanupSwipe()
}

function onWindowCancel(): void {
  cleanupSwipe()
}

function goToLane(index: number): void {
  cleanupSwipe()
  setActiveLane(index)
}

let applianceTimer: number | undefined

function onKeydown(event: KeyboardEvent): void {
  if (home.modalEntityId || home.pendingMerge) return
  const target = event.target as HTMLElement | null
  if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
  if (home.orientation === 'portrait') {
    if (event.key === 'ArrowRight') goToLane(home.activeLaneIdx + 1)
    if (event.key === 'ArrowLeft') goToLane(home.activeLaneIdx - 1)
  } else {
    if (event.key === 'ArrowDown') goToLane(home.activeLaneIdx + 1)
    if (event.key === 'ArrowUp') goToLane(home.activeLaneIdx - 1)
  }
}

watch(
  () => home.orientation,
  () => cleanupSwipe(),
)
watch(
  () => home.portraitTitlePos,
  () => cleanupSwipe(),
)
watch(
  () => home.modalEntityId,
  (value) => {
    if (value) cleanupSwipe()
  },
)

onMounted(() => {
  applianceTimer = window.setInterval(tickAppliances, 2200)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.clearInterval(applianceTimer)
  window.removeEventListener('keydown', onKeydown)
  detachSwipeListeners()
})
</script>

<template>
  <div class="relative h-dvh w-full overflow-hidden bg-[#1C1C1C] font-sans text-white">
    <!-- PORTRAIT -->
    <template v-if="home.orientation === 'portrait'">
      <!-- Top-centered room title -->
      <div v-if="home.portraitTitlePos === 'top'" class="flex h-full flex-col">
        <header class="flex h-14 shrink-0 items-center justify-center px-2">
          <div class="relative flex h-full w-full max-w-[540px] items-center justify-center">
            <button
              v-if="prevLane"
              type="button"
              class="absolute left-0 flex max-w-[27%] items-center gap-0.5 text-[11px] font-medium text-white/25 transition-colors hover:text-white/65"
              @click="goToLane(home.activeLaneIdx - 1)"
            >
              <AppIcon name="ChevronLeft" :size="14" class="shrink-0" />
              <span class="truncate">{{ prevLane.title }}</span>
            </button>

            <h1 class="max-w-[46%] truncate text-lg font-bold tracking-tight text-white">
              {{ activeLane.title }}
            </h1>

            <button
              v-if="nextLane"
              type="button"
              class="absolute right-0 flex max-w-[27%] items-center justify-end gap-0.5 text-[11px] font-medium text-white/25 transition-colors hover:text-white/65"
              @click="goToLane(home.activeLaneIdx + 1)"
            >
              <span class="truncate">{{ nextLane.title }}</span>
              <AppIcon name="ChevronRight" :size="14" class="shrink-0" />
            </button>
          </div>
        </header>

        <main
          class="relative min-h-0 flex-1 overflow-hidden"
          style="touch-action: pan-y"
          @pointerdown="onViewportPointerDown"
        >
          <div class="flex h-full w-full" :style="trackStyle">
            <section
              v-for="(lane, index) in home.lanes"
              :key="lane.id"
              class="flex h-full w-full shrink-0 flex-col px-2 sm:px-4"
              :inert="index !== home.activeLaneIdx ? true : undefined"
            >
              <div class="mx-auto flex h-full w-full max-w-[540px] flex-col">
                <AmbientTicker :lane="lane" />
                <div
                  class="grid min-h-0 flex-1 grid-flow-row-dense grid-cols-4 gap-3 overflow-y-auto pb-24 pt-3"
                  style="grid-auto-rows: minmax(68px, auto)"
                >
                  <TileDispatcher
                    v-for="entityId in lane.entityIds"
                    :key="entityId"
                    :entity="home.entities[entityId]"
                  />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <!-- Left-spine room titles -->
      <div v-else class="mx-auto flex h-full w-full max-w-[740px] px-3">
        <aside class="flex w-28 shrink-0 flex-col gap-4 pt-8 sm:w-36">
          <button
            v-for="(lane, index) in home.lanes"
            :key="lane.id"
            type="button"
            class="text-left leading-tight transition-colors"
            :class="
              index === home.activeLaneIdx
                ? 'text-lg font-bold text-white'
                : 'text-sm font-medium text-white/30 hover:text-white/65'
            "
            @click="goToLane(index)"
          >
            {{ lane.title }}
          </button>
        </aside>

        <main
          class="relative min-w-0 flex-1 overflow-hidden"
          style="touch-action: pan-y"
          @pointerdown="onViewportPointerDown"
        >
          <div class="flex h-full w-full" :style="trackStyle">
            <section
              v-for="(lane, index) in home.lanes"
              :key="lane.id"
              class="flex h-full w-full shrink-0 flex-col px-2 sm:px-3"
              :inert="index !== home.activeLaneIdx ? true : undefined"
            >
              <div class="mx-auto flex h-full w-full max-w-[560px] flex-col">
                <AmbientTicker :lane="lane" />
                <div
                  class="grid min-h-0 flex-1 grid-flow-row-dense grid-cols-4 gap-3 overflow-y-auto pb-24 pt-3"
                  style="grid-auto-rows: minmax(68px, auto)"
                >
                  <TileDispatcher
                    v-for="entityId in lane.entityIds"
                    :key="entityId"
                    :entity="home.entities[entityId]"
                  />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </template>

    <!-- LANDSCAPE (Google Nest Hub mode) -->
    <template v-else>
      <div class="flex h-full w-full">
        <aside class="flex w-36 shrink-0 flex-col justify-center gap-3 px-4 sm:w-44">
          <button
            v-for="(lane, index) in home.lanes"
            :key="lane.id"
            type="button"
            class="text-left leading-tight transition-colors"
            :class="
              index === home.activeLaneIdx
                ? 'text-xl font-bold text-white'
                : 'text-base font-medium text-white/30 hover:text-white/65'
            "
            @click="goToLane(index)"
          >
            {{ lane.title }}
          </button>
        </aside>

        <main
          class="relative min-w-0 flex-1 overflow-hidden"
          style="touch-action: pan-x"
          @pointerdown="onViewportPointerDown"
        >
          <div class="flex h-full w-full flex-col" :style="trackStyle">
            <section
              v-for="(lane, index) in home.lanes"
              :key="lane.id"
              class="flex h-full w-full shrink-0 flex-col px-4 py-3 sm:px-6"
              :inert="index !== home.activeLaneIdx ? true : undefined"
            >
              <div class="mx-auto flex h-full w-full max-w-6xl flex-col">
                <AmbientTicker :lane="lane" />
                <div class="mt-2 min-h-0 flex-1 overflow-x-auto overflow-y-auto pb-24">
                  <div
                    class="grid min-w-[660px] grid-flow-row-dense grid-cols-8 gap-3"
                    style="grid-auto-rows: minmax(68px, auto)"
                  >
                    <TileDispatcher
                      v-for="entityId in lane.entityIds"
                      :key="entityId"
                      :entity="home.entities[entityId]"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </template>

    <ControlsBar />
    <ToastStack />

    <DeepDiveModal v-if="modalEntity" :entity="modalEntity" />
    <MergeChoiceModal v-if="home.pendingMerge" />
  </div>
</template>
