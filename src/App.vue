<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useHome } from './state/home'
import type { Device } from './types'
import AppIcon from './components/AppIcon.vue'
import DeviceTile from './components/DeviceTile.vue'
import ConfigModal from './components/ConfigModal.vue'

const { state, toast, update, reset } = useHome()
const landscape = ref(window.matchMedia('(orientation: landscape)').matches)
const portraitTitlePos = ref<'top' | 'left'>('top')
const activeLaneIdx = ref(0)
const modalEntityId = ref('')
const swipeOffset = ref(0)
const swiping = ref(false)
const start = reactive({ x: 0, y: 0, locked: false })
const modalEntity = computed(() => state.entities[modalEntityId.value])
const trackStyle = computed(() => ({
  transform: landscape.value
    ? `translate3d(0, calc(${-activeLaneIdx.value * 100}% + ${swipeOffset.value}px), 0)`
    : `translate3d(calc(${-activeLaneIdx.value * 100}% + ${swipeOffset.value}px), 0, 0)`,
  transition: swiping.value ? 'none' : 'transform 380ms cubic-bezier(.22,1,.36,1)',
}))
function goTo(index: number) {
  activeLaneIdx.value = Math.max(0, Math.min(state.lanes.length - 1, index))
  swipeOffset.value = 0
}
function pointerDown(event: PointerEvent) {
  if (modalEntity.value || (event.target as HTMLElement).closest('.device-tile, button, input')) return
  start.x = event.clientX; start.y = event.clientY; start.locked = false
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}
function pointerMove(event: PointerEvent) {
  if (!(event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) return
  const dx = event.clientX - start.x
  const dy = event.clientY - start.y
  const delta = landscape.value ? dy : dx
  if (!start.locked && Math.abs(delta) > 8 && (landscape.value ? Math.abs(dy) > Math.abs(dx) : Math.abs(dx) > Math.abs(dy))) start.locked = true
  if (!start.locked) return
  swiping.value = true
  const atEdge = (activeLaneIdx.value === 0 && delta > 0) || (activeLaneIdx.value === state.lanes.length - 1 && delta < 0)
  swipeOffset.value = delta * (atEdge ? 0.25 : 1)
}
function pointerUp() {
  if (swipeOffset.value < -55 && activeLaneIdx.value < state.lanes.length - 1) activeLaneIdx.value++
  if (swipeOffset.value > 55 && activeLaneIdx.value > 0) activeLaneIdx.value--
  swipeOffset.value = 0; swiping.value = false; start.locked = false
}
function openModal(device: Device) { modalEntityId.value = device.id }
function resetDemo() { reset(); activeLaneIdx.value = 0; modalEntityId.value = '' }
function keydown(event: KeyboardEvent) {
  if (modalEntity.value || ['INPUT', 'BUTTON'].includes((event.target as HTMLElement).tagName)) return
  if (event.key === 'ArrowRight' && !landscape.value) goTo(activeLaneIdx.value + 1)
  if (event.key === 'ArrowLeft' && !landscape.value) goTo(activeLaneIdx.value - 1)
  if (event.key === 'ArrowDown' && landscape.value) goTo(activeLaneIdx.value + 1)
  if (event.key === 'ArrowUp' && landscape.value) goTo(activeLaneIdx.value - 1)
}
let applianceTimer: ReturnType<typeof setInterval>
onMounted(() => {
  window.addEventListener('keydown', keydown)
  applianceTimer = setInterval(() => {
    Object.values(state.entities).filter((device) => device.type === 'stateful_dishwasher' && device.state === 'running').forEach((device) => {
      update(device.id, { progress: Math.min(99, (device.progress || 0) + 1), remainingMinutes: Math.max(1, (device.remainingMinutes || 1) - 1) })
    })
  }, 2200)
})
onUnmounted(() => { window.removeEventListener('keydown', keydown); clearInterval(applianceTimer) })
</script>

<template>
  <main class="spatial-app" :class="{ landscape, 'title-left': portraitTitlePos === 'left' && !landscape }">
    <nav v-if="landscape || portraitTitlePos === 'left'" class="room-spine" aria-label="Pokoje i domeny">
      <button v-for="(lane, index) in state.lanes" :key="lane.id" :class="{ active: activeLaneIdx === index }" :aria-current="activeLaneIdx === index ? 'page' : undefined" @click="goTo(index)">{{ lane.title }}<span>{{ lane.entityIds.length }}</span></button>
    </nav>
    <section class="viewport" aria-label="Przestrzenny układ inteligentnego domu" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="pointerUp">
      <div class="lane-track" :style="trackStyle">
        <section v-for="(lane, laneIndex) in state.lanes" :key="lane.id" class="room-lane" :aria-hidden="activeLaneIdx !== laneIndex">
          <header v-if="!landscape && portraitTitlePos === 'top'" class="room-header">
            <button :disabled="laneIndex === 0" :aria-label="laneIndex > 0 ? `Poprzedni: ${state.lanes[laneIndex - 1].title}` : 'Brak poprzedniego pokoju'" @click="goTo(laneIndex - 1)"><AppIcon name="ArrowLeft" :size="15" /><span>{{ laneIndex > 0 ? state.lanes[laneIndex - 1].title.split(' ')[0] : '' }}</span></button>
            <div><h1>{{ lane.title }}</h1><p>{{ lane.subtitle }}</p></div>
            <button :disabled="laneIndex === state.lanes.length - 1" :aria-label="laneIndex < state.lanes.length - 1 ? `Następny: ${state.lanes[laneIndex + 1].title}` : 'Brak następnego pokoju'" @click="goTo(laneIndex + 1)"><span>{{ laneIndex < state.lanes.length - 1 ? state.lanes[laneIndex + 1].title.split(' ')[0] : '' }}</span><AppIcon name="ArrowRight" :size="15" /></button>
          </header>
          <div class="lane-scroll">
            <div class="ambient-ticker"><span class="ambient-lead"><AppIcon :name="lane.leadIcon" :size="16" /></span><span v-for="item in lane.ticker" :key="item.text" class="ambient-item"><AppIcon :name="item.icon" :size="14" />{{ item.text }}</span></div>
            <div class="tile-grid">
              <DeviceTile v-for="id in lane.entityIds" :key="id" :device="state.entities[id]" @open="openModal" />
            </div>
          </div>
        </section>
      </div>
    </section>
    <div class="floating-controls">
      <button @click="landscape = !landscape"><AppIcon :name="landscape ? 'PanelsTopLeft' : 'GalleryHorizontal'" :size="16" /><span>{{ landscape ? 'Landscape · Nest Hub' : 'Portrait · Przesuń pokój' }}</span></button>
      <button v-if="!landscape" @click="portraitTitlePos = portraitTitlePos === 'top' ? 'left' : 'top'"><AppIcon name="PanelLeft" :size="16" /><span>Tytuł: {{ portraitTitlePos === 'top' ? 'u góry' : 'po lewej' }}</span></button>
      <button aria-label="Resetuj demo" @click="resetDemo"><AppIcon name="RotateCcw" :size="16" /><span>Resetuj</span></button>
    </div>
    <Transition name="toast"><div v-if="toast" class="toast" role="status"><AppIcon name="Check" :size="17" />{{ toast }}</div></Transition>
    <ConfigModal v-if="modalEntity" :device="modalEntity" @close="modalEntityId = ''" />
  </main>
</template>
