<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, Volume2 } from 'lucide-vue-next'
import type { Entity } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import { effectiveSpan } from '../../utils/tile'
import { toggleIcon, toggleMainButton } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none">
    <TileTopRow
      :entity="entity"
      :on-button="(button) => toggleMainButton(entity, button.id)"
      @icon="toggleIcon(entity)"
    />

    <div
      v-if="span.r >= 2"
      class="mt-auto flex flex-col gap-2 pt-2.5"
      data-no-tile
      @pointerdown.stop
      @click.stop
    >
      <div class="flex items-center gap-2 rounded-full bg-white/[0.05] px-3.5 py-2 text-[11px] text-white/80">
        <Volume2 :size="13" class="shrink-0 text-[#73B7B2]" />
        <span class="truncate">Dźwięk: {{ entity.soundContext }}</span>
      </div>
      <div class="flex items-center gap-2 rounded-full bg-white/[0.05] px-3.5 py-2 text-[11px] text-white/80">
        <Sparkles :size="13" class="shrink-0 text-[#73B7B2]" />
        <span class="truncate">{{ entity.prediction }}</span>
      </div>
    </div>
  </TileFrame>
</template>
