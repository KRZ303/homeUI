<script setup lang="ts">
import { computed } from 'vue'
import type { Entity, GroupMember, MainButton } from '../../types'
import TileFrame from '../TileFrame.vue'
import TileTopRow from '../TileTopRow.vue'
import AppIcon from '../icons/AppIcon.vue'
import { effectiveSpan, surfaceClassFor } from '../../utils/tile'
import { toggleIcon, toggleMainButton, toggleMember } from '../../stores/home'

const { entity } = defineProps<{ entity: Entity }>()
const span = computed(() => effectiveSpan(entity))
const members = computed(() => entity.members ?? [])
const activeCount = computed(() => members.value.filter((member) => member.active).length)
const anyActive = computed(() => activeCount.value > 0)

const iconClass = computed(() =>
  anyActive.value
    ? 'bg-[#2C3745] text-[#73B7B2]'
    : 'bg-white/[0.08] text-white/60',
)

function onMain(button: MainButton): void {
  toggleMainButton(entity, button)
}

function onMember(member: GroupMember): void {
  toggleMember(entity, member.id)
}
</script>

<template>
  <TileFrame
    :entity="entity"
    drag-mode="none"
    :surface-class="surfaceClassFor(entity)"
  >
    <TileTopRow
      :entity="entity"
      :c="span.c"
      :icon-class="iconClass"
      track-mode="progress"
      :track-active="anyActive"
      :track-pct="members.length ? (activeCount / members.length) * 100 : 0"
      track-fill-class="bg-[#73B7B2]/30"
      @icon="toggleIcon(entity)"
      @main="onMain"
    />

    <div
      v-if="span.r >= 2 && entity.expandedContent.secondaryButtons"
      class="mt-auto grid grid-cols-4 gap-2 pt-2.5"
    >
      <button
        v-for="member in members"
        :key="member.id"
        type="button"
        data-no-tile
        class="flex h-[34px] min-w-0 items-center justify-center gap-1.5 rounded-full px-2 transition-colors active:scale-[0.97]"
        :class="
          member.active
            ? 'bg-[#73B7B2] text-[#1D3130] shadow-sm'
            : 'bg-black/25 text-white/60 hover:bg-black/35'
        "
        :title="member.label"
        :aria-label="member.label"
        @pointerdown.stop
        @click.stop="onMember(member)"
      >
        <AppIcon :name="member.icon" :type="member.iconType" :size="15" class="shrink-0" />
        <span v-if="span.c >= 4" class="truncate text-[10px] font-semibold">{{ member.label }}</span>
      </button>
    </div>
  </TileFrame>
</template>
