<script setup lang="ts">
import { computed } from 'vue'
import type { Entity } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import AppIcon from '../icons/AppIcon.vue'
import { effectiveSpan } from '../../utils/tile'
import { toggleIcon, toggleMember } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))
const members = computed(() => entity.members ?? [])
</script>

<template>
  <TileFrame :entity="entity" drag-mode="none">
    <TileTopRow :entity="entity" @icon="toggleIcon(entity)" />

    <div
      v-if="span.r >= 2 && entity.expandedContent.secondaryButtons"
      class="mt-auto grid grid-cols-4 gap-2 pt-2.5"
      data-no-tile
      @pointerdown.stop
      @click.stop
    >
      <button
        v-for="member in members"
        :key="member.id"
        type="button"
        class="flex h-[34px] min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-[12px] font-semibold transition-colors"
        :class="
          member.active
            ? 'bg-[#73B7B2] text-[#1D3130] shadow-sm'
            : 'bg-black/25 text-white/60 hover:bg-black/35'
        "
        @click.stop="toggleMember(entity, member.id)"
      >
        <AppIcon :name="member.icon" :icon-type="member.iconType" :size="14" class="shrink-0" />
        <span v-if="span.c >= 4" class="truncate">{{ member.label }}</span>
      </button>
    </div>
  </TileFrame>
</template>
