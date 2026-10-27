<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import AppIcon from '../icons/AppIcon.vue'
import { effectiveSpan, surfaceClassFor } from '../../utils/tile'
import { toggleIcon, toggleMainButton } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))

const iconClass = computed(() =>
  entity.active
    ? 'bg-[#73B7B2] text-[#182C2A]'
    : 'bg-white/[0.09] text-white/60',
)

function onMain(button: MainButton): void {
  toggleMainButton(entity, button)
}
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none" :surface-class="surfaceClassFor(entity)">
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      :buttons="entity.mainButtons"
      track-mode="none"
      :subtitle="entity.active ? entity.activity : 'Czujnik prywatności wyciszony'"
      @icon="toggleIcon(entity)"
      @main="onMain"
    />

    <div
      v-if="span.r >= 2 && entity.expandedContent.presets"
      class="mt-auto flex flex-col gap-1.5 pt-2.5"
    >
      <div
        class="flex h-9 items-center gap-2 rounded-full bg-black/25 px-3 text-[11px] text-white/80"
      >
        <AppIcon name="Volume2" :size="14" class="shrink-0 text-[#73B7B2]" />
        <span class="truncate">Dźwięk: {{ entity.soundContext }}</span>
      </div>
      <div
        class="flex h-9 items-center gap-2 rounded-full bg-black/25 px-3 text-[11px] text-white/80"
      >
        <AppIcon name="Sparkles" :size="14" class="shrink-0 text-[#73B7B2]" />
        <span class="truncate">{{ entity.prediction }}</span>
      </div>
    </div>
  </TileFrame>
</template>
