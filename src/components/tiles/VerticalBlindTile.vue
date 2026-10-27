<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown, ArrowUp, Pause } from 'lucide-vue-next'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import EmbeddedSlider from '../EmbeddedSlider.vue'
import { effectiveSpan, verticalFillHeight } from '../../utils/tile'
import { setBlind, setTilt, toggleIcon } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))

function onMain(button: MainButton): void {
  if (button.id === 'tilt_45') entity.tilt = 45
  else if (button.id === 'privacy_0') entity.tilt = 0
  entity.mainButtons?.forEach((candidate) => {
    candidate.active = candidate.id === button.id
  })
}

const fillHeight = computed(() => verticalFillHeight(entity.position ?? 0))
</script>

<template>
  <TileFrame
    :entity="entity"
    drag-mode="vertical"
    surface-class="bg-[#303030]"
    @slide="setBlind(entity, $event)"
  >
    <TileTopRow :entity="entity" :on-button="onMain" @icon="toggleIcon(entity)" />

    <!-- Left-side 52px vertical slider capsule -->
    <div
      data-track
      class="pointer-events-none absolute bottom-2 left-2 top-2 w-[52px] overflow-hidden rounded-full bg-black/30"
    >
      <div
        class="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-[#3B6E6C]/80 to-[#73B7B2]/55 transition-all duration-100"
        :style="{ height: fillHeight }"
      >
        <div
          v-if="(entity.position ?? 0) > 0"
          class="absolute bottom-2.5 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-white/50"
        ></div>
      </div>
    </div>

    <!-- Rows 2–3: stacked secondary controls right of the vertical slider -->
    <div
      class="relative z-10 mt-auto flex flex-col gap-2 pl-[54px] pt-2.5"
      data-no-tile
      @pointerdown.stop
      @click.stop
    >
      <button
        type="button"
        class="flex h-9 items-center justify-center gap-2 rounded-full bg-black/25 px-3 text-xs font-semibold text-white/90 transition-colors hover:bg-black/35"
        @click.stop="setBlind(entity, 100)"
      >
        <ArrowUp :size="14" class="text-[#73B7B2]" />
        Otwórz 100%
      </button>
      <button
        type="button"
        class="flex h-9 items-center justify-center gap-2 rounded-full bg-black/25 px-3 text-xs font-semibold text-white/90 transition-colors hover:bg-black/35"
        @click.stop="setBlind(entity, 50)"
      >
        <Pause :size="14" class="text-[#73B7B2]" />
        Stop / 50%
      </button>
      <button
        type="button"
        class="flex h-9 items-center justify-center gap-2 rounded-full bg-black/25 px-3 text-xs font-semibold text-white/90 transition-colors hover:bg-black/35"
        @click.stop="setBlind(entity, 0)"
      >
        <ArrowDown :size="14" class="text-[#73B7B2]" />
        Zamknij 0%
      </button>

      <EmbeddedSlider
        v-if="span.c === 4 && entity.expandedContent.secondarySlider"
        label="Kąt nachylenia lameli"
        :value="entity.tilt ?? 0"
        :min="0"
        :max="90"
        suffix="°"
        @update="setTilt(entity, $event)"
      />
    </div>
  </TileFrame>
</template>
