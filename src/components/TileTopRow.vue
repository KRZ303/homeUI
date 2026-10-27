<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Check, ChevronDown } from 'lucide-vue-next'
import type { Entity, MainButton } from '../types'
import {
  defaultIconName,
  effectiveSpan,
  iconClassFor,
  maxInlineForSpan,
  subtitleFor,
  trackFillWidth,
  trackModelFor,
  type TrackModel,
} from '../utils/tile'
import { handleMainButton, toggleIcon } from '../stores/home'
import AppIcon from './icons/AppIcon.vue'

const props = withDefaults(
  defineProps<{
    entity: Entity
    iconName?: string
    iconClass?: string
    track?: TrackModel | null
    trackFillClass?: string
    buttons?: MainButton[]
    subtitle?: string | null
    onButton?: (button: MainButton) => void
  }>(),
  {
    iconName: undefined,
    iconClass: undefined,
    track: undefined,
    trackFillClass: undefined,
    buttons: undefined,
    subtitle: undefined,
    onButton: undefined,
  },
)

const emit = defineEmits<{
  (event: 'icon'): void
}>()

const c = computed(() => effectiveSpan(props.entity).c)
const dropdownOpen = ref(false)
const dropdownWrap = ref<HTMLElement | null>(null)

const subtitleText = computed(() =>
  props.subtitle === undefined ? subtitleFor(props.entity) : props.subtitle ?? '',
)
const iconForTile = computed(() => props.iconName ?? defaultIconName(props.entity))
const iconClassForTile = computed(() => props.iconClass ?? iconClassFor(props.entity))
const trackModel = computed<TrackModel | null>(() =>
  props.track === undefined ? trackModelFor(props.entity) : props.track,
)
const trackFillClass = computed(() => props.trackFillClass ?? trackModel.value?.colorClass ?? '')

const hasTrack = computed(() => (trackModel.value?.mode ?? 'none') !== 'none')
const cap = computed(() => maxInlineForSpan(c.value))

const cappedButtons = computed(() => (props.buttons ?? props.entity.mainButtons ?? []).slice(0, 4))
const inlineButtons = computed(() => (c.value <= 1 ? [] : cappedButtons.value.slice(0, cap.value)))
const collapsed = computed(() => c.value > 1 && cappedButtons.value.length > cap.value)
const labelledInline = computed(() => inlineButtons.value.filter((button) => button.showLabel).length)
const compactLabels = computed(() => c.value >= 4 && labelledInline.value >= 3)

function buttonClass(button: MainButton): string {
  if (button.active) {
    if (button.activeClass) return button.activeClass
    if (hasTrack.value) {
      return 'bg-[#73B7B2]/30 text-teal-50 border border-[#73B7B2]/45 backdrop-blur-[2px] hover:bg-[#73B7B2]/40'
    }
    return 'bg-[#73B7B2] text-[#182C2A]'
  }
  if (hasTrack.value) {
    return 'bg-black/25 text-white/90 border border-white/10 backdrop-blur-[2px] hover:bg-black/40'
  }
  return 'bg-white/[0.08] text-white/85 hover:bg-white/[0.16]'
}

function popoverClass(button: MainButton): string {
  if (button.active) {
    if (button.activeClass) return button.activeClass
    return 'bg-[#73B7B2] text-[#182C2A] border border-[#73B7B2]/45 shadow-lg backdrop-blur-md'
  }
  return 'bg-[#303030] text-white/90 border border-white/10 shadow-lg backdrop-blur-md'
}

function triggerMain(button: MainButton): void {
  dropdownOpen.value = false
  if (props.onButton) props.onButton(button)
  else handleMainButton(props.entity, button, button.id)
}

function onDocPointer(event: PointerEvent): void {
  if (!dropdownWrap.value?.contains(event.target as Node)) dropdownOpen.value = false
}

watch(dropdownOpen, (open) => {
  if (open) document.addEventListener('pointerdown', onDocPointer, true)
  else document.removeEventListener('pointerdown', onDocPointer, true)
})

onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocPointer, true))

const fillWidth = computed(() =>
  trackFillWidth(trackModel.value?.pct ?? 0, Boolean(trackModel.value?.active)),
)
</script>

<template>
  <div class="relative flex h-11 w-full shrink-0 select-none items-center justify-between">
    <!-- Oversized 52px capsule track (-inset-1 halo around the 44px icon) -->
    <div
      v-if="hasTrack"
      data-track
      class="pointer-events-none absolute -inset-1 overflow-hidden rounded-full bg-black/30 transition-colors"
    >
      <div
        class="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
        :class="trackFillClass"
        :style="{ width: fillWidth }"
      ></div>
      <div
        v-if="trackModel?.mode === 'slider' && trackModel.active"
        class="absolute right-2 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-white/45"
      ></div>
    </div>

    <!-- Invariant 44px circular icon (top: 12px, left: 12px) -->
    <button
      type="button"
      data-no-tile
      class="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
      :class="iconClassForTile"
      :aria-label="entity.title"
      @pointerdown.stop
      @click.stop="emit('icon')"
    >
      <AppIcon :name="iconForTile" :icon-type="entity.iconType" :size="20" />
    </button>

    <!-- Title + subtitle stack -->
    <div
      class="pointer-events-none relative z-10 min-w-0 flex-1"
      :class="[
        c === 1 ? 'ml-1.5' : 'mx-2.5',
        c >= 4 ? 'min-w-[128px]' : c === 3 ? 'min-w-[86px]' : '',
      ]"
    >
      <div
        class="truncate font-bold leading-tight text-white"
        :class="c === 1 ? 'text-[13px]' : 'text-[15px]'"
        :title="entity.title"
      >
        {{ entity.title }}
      </div>
      <div
        v-if="subtitleText"
        class="mt-0.5 truncate text-[11px] leading-tight text-white/80 tabular-nums"
      >
        {{ subtitleText }}
      </div>
    </div>

    <!-- Main Buttons (Top Row right side) -->
    <div
      v-if="c > 1 && cappedButtons.length"
      ref="dropdownWrap"
      data-no-tile
      class="relative z-10 flex min-w-0 shrink items-center gap-1.5"
      @pointerdown.stop
    >
      <template v-if="!collapsed">
        <button
          v-for="button in inlineButtons"
          :key="button.id"
          type="button"
          class="flex h-9 items-center justify-center rounded-full font-semibold transition-all active:scale-95"
          :class="[
            compactLabels ? 'text-[10px]' : 'text-xs',
            buttonClass(button),
            button.showLabel
              ? `min-w-0 overflow-hidden ${compactLabels ? 'gap-1 px-1.5' : c >= 4 ? 'gap-1.5 px-2.5' : 'gap-1.5 px-3'}`
              : 'w-9 shrink-0',
          ]"
          :title="button.label"
          :aria-label="button.label"
          @click.stop="triggerMain(button)"
        >
          <AppIcon
            :name="button.icon"
            :icon-type="button.iconType"
            :size="compactLabels ? 13 : 15"
            class="shrink-0"
          />
          <span v-if="button.showLabel" class="min-w-0 truncate">{{ button.label }}</span>
        </button>
      </template>

      <template v-else>
        <button
          type="button"
          class="flex h-9 items-center gap-1 border-0 bg-transparent px-1.5 text-xs font-semibold text-white/85 shadow-none transition-colors hover:text-white"
          :aria-expanded="dropdownOpen"
          aria-label="Pokaż przyciski główne"
          @click.stop="dropdownOpen = !dropdownOpen"
        >
          <AppIcon
            v-if="cappedButtons[0]"
            :name="cappedButtons[0].icon"
            :icon-type="cappedButtons[0].iconType"
            :size="15"
          />
          <span class="tabular-nums">{{ cappedButtons.length }}</span>
          <AppIcon name="ChevronDown" :size="13" :class="dropdownOpen ? 'rotate-180' : ''" />
        </button>

        <!-- Borderless, backgroundless floating popover -->
        <div
          v-if="dropdownOpen"
          class="absolute right-0 top-11 z-50 flex flex-col items-end gap-1.5 border-0 bg-transparent p-0 shadow-none"
        >
          <button
            v-for="button in cappedButtons"
            :key="button.id"
            type="button"
            class="flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition-all active:scale-95"
            :class="popoverClass(button)"
            @click.stop="triggerMain(button)"
          >
            <AppIcon :name="button.icon" :icon-type="button.iconType" :size="14" />
            <span>{{ button.label }}</span>
            <Check v-if="button.active" :size="13" class="ml-0.5 shrink-0" />
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
