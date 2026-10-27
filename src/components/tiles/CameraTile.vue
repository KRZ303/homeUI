<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { showToast, toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()

const buttons = computed<MainButton[]>(() => [
  { id: 'ptz', label: 'Preset PTZ', icon: 'Compass', active: false },
  { id: 'privacy', label: 'Prywatność', icon: 'Eye', active: !entity.privacy },
])

function onMain(button: MainButton): void {
  if (button.id === 'privacy') entity.privacy = !entity.privacy
  else showToast(`Kamera: ustawiono preset PTZ — ${entity.ptzPreset ?? ''}`)
}
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none">
    <TileTopRow :entity="entity" :buttons="buttons" :on-button="onMain" @icon="toggleIcon(entity)" />

    <div
      class="mt-auto flex items-center justify-between gap-2 pt-2.5"
      data-no-tile
      @pointerdown.stop
      @click.stop
    >
      <span class="min-w-0 truncate rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] text-white/80">
        {{ entity.detections }}
      </span>
      <span
        v-if="!entity.privacy"
        class="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-emerald-300"
      >
        <span class="ets-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
        LIVE
      </span>
    </div>
  </TileFrame>
</template>
