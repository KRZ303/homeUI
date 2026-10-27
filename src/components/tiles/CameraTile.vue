<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import AppIcon from '../icons/AppIcon.vue'
import { effectiveSpan, surfaceClassFor } from '../../utils/tile'
import { showToast } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))
const PTZ_PRESETS = ['Brama & Podjazd', 'Furta wejściowa', 'Taras', 'Garaż']

const iconName = computed(() => (entity.privacy ? 'EyeOff' : 'Camera'))
const iconClass = computed(() =>
  entity.privacy
    ? 'bg-rose-500/30 text-rose-200'
    : 'bg-[#73B7B2] text-[#182C2A]',
)

const buttons = computed<MainButton[]>(() => [
  {
    id: 'preset',
    label: 'Preset PTZ',
    icon: 'Compass',
    active: false,
  },
  {
    id: 'privacy',
    label: 'Prywatność',
    icon: 'Eye',
    active: Boolean(entity.privacy),
  },
])

function onMain(button: MainButton): void {
  if (button.id === 'privacy') {
    entity.privacy = !entity.privacy
    return
  }
  if (button.id === 'preset') {
    const index = PTZ_PRESETS.indexOf(entity.ptzPreset ?? PTZ_PRESETS[0])
    entity.ptzPreset = PTZ_PRESETS[(index + 1) % PTZ_PRESETS.length]
    showToast(`Preset PTZ: ${entity.ptzPreset}`)
  }
}
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none" :surface-class="surfaceClassFor(entity)">
    <div class="pointer-events-none absolute inset-0 overflow-hidden rounded-[30px]">
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(115,183,178,0.16),transparent_58%)]"
      />
      <div
        class="absolute inset-0 opacity-40"
        :style="{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }"
      />
      <AppIcon
        name="Camera"
        :size="96"
        class="absolute -right-2 top-16 text-white/[0.045]"
      />
    </div>

    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      :icon-name="iconName"
      :buttons="buttons"
      track-mode="none"
      @icon="entity.privacy = !entity.privacy"
      @main="onMain"
    />

    <div v-if="span.r >= 2" class="relative mt-auto flex items-center justify-between gap-2 pt-2.5">
      <div
        class="flex h-8 min-w-0 items-center gap-1.5 rounded-full bg-black/30 px-2.5 text-[10px] text-white/80"
      >
        <AppIcon name="Sparkles" :size="11" class="shrink-0 text-[#73B7B2]" />
        <span class="truncate">{{ entity.detections }}</span>
      </div>
      <div
        v-if="!entity.privacy"
        class="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1.5 text-[9px] font-bold tracking-wide text-emerald-300"
      >
        <span class="ets-live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
        LIVE
      </div>
      <div
        v-else
        class="flex shrink-0 items-center gap-1 rounded-full bg-rose-500/15 px-2 py-1.5 text-[9px] font-bold tracking-wide text-rose-300"
      >
        <AppIcon name="EyeOff" :size="10" />
        PRYWATNOŚĆ
      </div>
    </div>
  </TileFrame>
</template>
