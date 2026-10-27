<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useHomeStore } from './store';
import AmbientTickerBar from './components/AmbientTickerBar.vue';
import TileDispatcher from './components/TileDispatcher.vue';
import ControlsBar from './components/ControlsBar.vue';
import DeepDiveModal from './components/DeepDiveModal.vue';
import MergeChoiceModal from './components/MergeChoiceModal.vue';
import ToastStack from './components/ToastStack.vue';

const store = useHomeStore();

const lanes = computed(() => store.lanes);
const orientation = computed(() => store.orientation.value);
const titlePos = computed(() => store.portraitTitlePos.value);
const activeLaneIdx = computed(() => store.activeLaneIdx.value);

const swipeOffset = ref(0);

// ---------- Room viewport physics (§3.1) ----------
let px0 = 0;
let py0 = 0;
let panCandidate = false;
let swipingViewport = false;

const trackStyle = computed(() => {
  const base = -activeLaneIdx.value * 100;
  const off = `${swipeOffset.value}px`;
  const transition = swipingViewport ? 'none' : 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)';
  if (orientation.value === 'portrait') {
    return { transform: `translate3d(calc(${base}% + ${off}), 0, 0)`, transition };
  }
  return { transform: `translate3d(0, calc(${base}% + ${off}), 0)`, transition };
});

function onViewportPointerDown(e: PointerEvent) {
  if (store.modalEntityId.value !== null || store.pendingMergeChoice.value !== null) return;
  if (gestureActive) return; // tile drag in progress
  const target = e.target as Element;
  if (target.closest('[data-eid]') || target.closest('[data-controls]') || target.closest('[data-modal-layer]')) return;
  px0 = e.clientX;
  py0 = e.clientY;
  panCandidate = true;
  swipingViewport = false;
  swipeOffset.value = 0;
}

function onViewportPointerMove(e: PointerEvent) {
  if (!panCandidate || gestureActive) return;
  const dx = e.clientX - px0;
  const dy = e.clientY - py0;
  if (!swipingViewport) {
    const horizontalLock = Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy);
    const verticalLock = Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx);
    const wanted = orientation.value === 'portrait' ? horizontalLock : verticalLock;
    if (wanted) {
      swipingViewport = true;
      store.swiping.value = true;
    } else {
      return;
    }
  }
  const primaryDelta = orientation.value === 'portrait' ? dx : dy;
  let delta = primaryDelta;
  const last = lanes.value.length - 1;
  if (activeLaneIdx.value === 0 && delta > 0) delta *= 0.25;
  if (activeLaneIdx.value === last && delta < 0) delta *= 0.25;
  swipeOffset.value = delta;
}

function onViewportPointerUp() {
  if (swipingViewport) {
    if (swipeOffset.value < -55 && activeLaneIdx.value < lanes.value.length - 1) {
      store.activeLaneIdx.value = activeLaneIdx.value + 1;
    } else if (swipeOffset.value > 55 && activeLaneIdx.value > 0) {
      store.activeLaneIdx.value = activeLaneIdx.value - 1;
    }
    swipingViewport = false;
    store.swiping.value = false;
  }
  swipeOffset.value = 0;
  panCandidate = false;
}

// ---------- Tile gesture controller (§5.1 / §5.3) ----------
let gestureActive = false;
let gestureMoved = false;
let candidateId: string | null = null;

function onTileGesturePointerDown(e: PointerEvent) {
  if (store.modalEntityId.value !== null || store.pendingMergeChoice.value !== null) return;
  const target = e.target as Element;
  const tile = target.closest('[data-eid]');
  if (!tile) return;
  candidateId = tile.getAttribute('data-eid');
  if (!candidateId) return;
  gestureActive = true;
  gestureMoved = false;
  px0 = e.clientX;
  py0 = e.clientY;
}

function onTileGesturePointerMove(e: PointerEvent) {
  if (!gestureActive || !candidateId) return;
  const dist = Math.hypot(e.clientX - px0, e.clientY - py0);
  if (dist > 6 && !gestureMoved) {
    gestureMoved = true;
    store.dragTileId.value = candidateId;
    store.dropTargetId.value = null;
  }
  if (!gestureMoved) return;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const target = el?.closest('[data-eid]');
  const hoverId = target?.getAttribute('data-eid') ?? null;
  store.dropTargetId.value = hoverId && hoverId !== candidateId ? hoverId : null;
}

function onTileGesturePointerUp() {
  if (gestureActive && candidateId && gestureMoved) {
    const targetId = store.dropTargetId.value;
    store.dragTileId.value = null;
    store.dropTargetId.value = null;
    if (targetId && targetId !== candidateId) {
      store.handleDropTileOnTile(candidateId, targetId);
    }
  } else if (gestureActive && candidateId && !gestureMoved && store.modalEntityId.value === null) {
    store.openModal(candidateId);
  }
  gestureActive = false;
  gestureMoved = false;
  candidateId = null;
}

// ---------- keyboard ----------
function onKeydown(e: KeyboardEvent) {
  const last = lanes.value.length - 1;
  if (e.key === 'Escape') {
    store.closeModal();
    return;
  }
  if (store.modalEntityId.value !== null) return;
  if (orientation.value === 'portrait') {
    if (e.key === 'ArrowLeft' && activeLaneIdx.value > 0) store.activeLaneIdx.value = activeLaneIdx.value - 1;
    if (e.key === 'ArrowRight' && activeLaneIdx.value < last) store.activeLaneIdx.value = activeLaneIdx.value + 1;
  } else {
    if (e.key === 'ArrowUp' && activeLaneIdx.value > 0) store.activeLaneIdx.value = activeLaneIdx.value - 1;
    if (e.key === 'ArrowDown' && activeLaneIdx.value < last) store.activeLaneIdx.value = activeLaneIdx.value + 1;
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onViewportPointerDown);
  document.addEventListener('pointermove', onViewportPointerMove);
  document.addEventListener('pointerup', onViewportPointerUp);
  document.addEventListener('pointercancel', onViewportPointerUp);
  document.addEventListener('pointerdown', onTileGesturePointerDown);
  document.addEventListener('pointermove', onTileGesturePointerMove);
  document.addEventListener('pointerup', onTileGesturePointerUp);
  document.addEventListener('pointercancel', onTileGesturePointerUp);
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onViewportPointerDown);
  document.removeEventListener('pointermove', onViewportPointerMove);
  document.removeEventListener('pointerup', onViewportPointerUp);
  document.removeEventListener('pointercancel', onViewportPointerUp);
  document.removeEventListener('pointerdown', onTileGesturePointerDown);
  document.removeEventListener('pointermove', onTileGesturePointerMove);
  document.removeEventListener('pointerup', onTileGesturePointerUp);
  document.removeEventListener('pointercancel', onTileGesturePointerUp);
  window.removeEventListener('keydown', onKeydown);
});

const gridClass = computed(() =>
  orientation.value === 'portrait'
    ? 'grid grid-cols-4 gap-3 grid-flow-row-dense min-h-0'
    : 'grid grid-cols-4 md:grid-cols-8 gap-3 grid-flow-row-dense min-w-[660px] min-h-0',
);
</script>

<template>
  <div class="w-full h-dvh overflow-hidden bg-[#1C1C1C] text-white">
    <main class="w-full h-full">
      <div class="lanes-track flex h-full w-full" :class="orientation === 'landscape' ? 'flex-col' : ''" :style="trackStyle">
        <section
          v-for="(lane, idx) in lanes"
          :key="lane.id"
          class="h-full w-full shrink-0 relative"
          :class="idx < lanes.length - 1 ? (orientation === 'landscape' ? 'border-b border-white/5' : 'border-r border-white/5') : ''"
        >
          <!-- Portrait: top-centered borderless room title -->
          <div
            v-if="orientation === 'portrait' && titlePos === 'top' && idx === activeLaneIdx"
            class="absolute inset-x-0 top-2 z-20 pointer-events-none flex items-center justify-center"
          >
            <button
              class="absolute left-3 text-sm font-medium text-white/25 hover:text-white/65 transition-colors pointer-events-auto"
              :disabled="idx === 0"
              @click="idx > 0 && (store.activeLaneIdx.value = idx - 1)"
            >
              ← {{ lanes[idx - 1]?.title.split(' ')[0] ?? 'Poprzedni' }}
            </button>
            <div class="text-lg font-bold text-white">{{ lane.title }}</div>
            <button
              class="absolute right-3 text-sm font-medium text-white/25 hover:text-white/65 transition-colors pointer-events-auto"
              :disabled="idx === lanes.length - 1"
              @click="idx < lanes.length - 1 && (store.activeLaneIdx.value = idx + 1)"
            >
              {{ lanes[idx + 1]?.title.split(' ')[0] ?? 'Następny' }} →
            </button>
          </div>

          <!-- Portrait, left-spine title mode -->
          <div
            v-if="orientation === 'portrait' && titlePos === 'left' && idx === activeLaneIdx"
            class="absolute inset-y-0 left-0 w-36 z-20 pointer-events-none flex flex-col justify-center gap-1 pl-4"
          >
            <button
              v-for="(l, li) in lanes"
              :key="`p${l.id}`"
              class="text-left truncate text-xs font-bold pointer-events-auto transition-colors"
              :class="li === idx ? 'text-white text-sm' : 'text-white/25 hover:text-white/65'"
              @click="store.activeLaneIdx.value = li"
            >
              {{ l.title }}
            </button>
          </div>

          <!-- Landscape: borderless vertical left spine -->
          <aside
            v-if="orientation === 'landscape'"
            class="absolute inset-y-0 left-0 w-44 z-20 pointer-events-none flex flex-col justify-center gap-1.5 pl-6"
          >
            <button
              v-for="(l, li) in lanes"
              :key="`s${l.id}`"
              class="text-left truncate pointer-events-auto transition-colors"
              :class="li === idx ? 'text-xl font-bold text-white' : 'text-base font-medium text-white/30 hover:text-white/65'"
              @click="store.activeLaneIdx.value = li"
            >
              {{ l.title }}
            </button>
          </aside>

          <div
            class="h-full w-full overflow-y-auto"
            :style="{ touchAction: orientation === 'portrait' ? 'pan-y' : 'none' }"
            :class="orientation === 'portrait' ? (titlePos === 'left' ? 'pl-36' : '') : 'pl-44'"
          >
            <div
              class="mx-auto flex flex-col"
              :class="orientation === 'portrait' ? 'max-w-[540px] px-4 pt-10 pb-24' : 'max-w-6xl px-4 pt-4 pb-24'"
            >
              <AmbientTickerBar :lane="lane" />
              <div :class="gridClass" class="mt-2">
                <template v-for="eid in lane.entityIds" :key="eid">
                  <TileDispatcher v-if="store.entities[eid]" :id="eid" :lane-entity-ids="lane.entityIds" />
                </template>
              </div>
              <div class="mt-6 text-[11px] text-white/35 text-center">{{ lane.subtitle }}</div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <div data-controls>
      <ControlsBar />
    </div>

    <div data-modal-layer>
      <DeepDiveModal />
      <MergeChoiceModal />
      <ToastStack />
    </div>
  </div>
</template>
