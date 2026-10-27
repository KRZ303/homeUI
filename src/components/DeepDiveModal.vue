<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import type { Entity, ExpandedContent, ExpanderKey, Span } from '../types'
import { effectiveSpan, isSliderBasedEntity } from '../utils/tile'
import {
  closeModal,
  home,
  requestCompose,
  setSpan,
  toggleExpandedContent,
  toggleExpander,
  unnestTile,
} from '../stores/home'
import AppIcon from './icons/AppIcon.vue'

const { entity } = defineProps<{ entity: Entity }>()

const span = computed(() => effectiveSpan(entity))
const horizontalSlider = computed(() =>
  ['slider_light', 'rich_ac_row', 'stateful_tv'].includes(entity.type),
)

const sizeOptions = computed<Span[]>(() => {
  if (entity.type === 'vertical_blind') {
    return [
      { c: 2, r: 3 },
      { c: 3, r: 3 },
      { c: 4, r: 3 },
    ]
  }
  if (horizontalSlider.value) {
    return [
      { c: 2, r: 1 },
      { c: 2, r: 2 },
      { c: 3, r: 2 },
      { c: 4, r: 1 },
      { c: 4, r: 2 },
    ]
  }
  return [
    { c: 1, r: 1 },
    { c: 2, r: 1 },
    { c: 2, r: 2 },
    { c: 3, r: 3 },
    { c: 4, r: 1 },
    { c: 4, r: 2 },
    { c: 4, r: 3 },
  ]
})

const expanderOptions: { key: ExpanderKey; label: string; sub: string; icon: string }[] = [
  { key: 'down', label: 'W dół (↓)', sub: 'Środek na dole', icon: 'ChevronDown' },
  { key: 'right', label: 'W bok (→)', sub: 'Środek po prawej', icon: 'ChevronRight' },
  { key: 'diagonal', label: 'Ukośnie (↘)', sub: 'Prawy dolny róg', icon: 'ArrowDownRight' },
]

const expandedOptions: { key: keyof ExpandedContent; label: string; sub: string }[] = [
  { key: 'secondaryButtons', label: 'Przyciski dodatkowe', sub: 'Secondary buttons' },
  { key: 'secondarySlider', label: 'Dodatkowy suwak', sub: 'Barwa K / Nawiew' },
  { key: 'presets', label: 'Szybkie presety', sub: 'Tryby Eco / Komfort' },
]

const lane = computed(() => home.lanes.find((candidate) => candidate.id === entity.column))
const otherEntities = computed<Entity[]>(() =>
  (lane.value?.entityIds ?? [])
    .filter((id) => id !== entity.id)
    .map((id) => home.entities[id])
    .filter((candidate): candidate is Entity => Boolean(candidate)),
)

const nestedEntities = computed<Entity[]>(() =>
  (entity.nestedTiles ?? [])
    .map((id) => home.entities[id])
    .filter((candidate): candidate is Entity => Boolean(candidate)),
)

const jsonState = computed(() => JSON.stringify(entity, null, 2))

function isActiveSize(option: Span): boolean {
  return span.value.c === option.c && span.value.r === option.r
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') closeModal()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      class="ets-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      @click.self="closeModal"
    >
      <div
        role="dialog"
        aria-modal="true"
        class="ets-modal-in flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[32px] bg-[#252525] shadow-2xl"
      >
        <header class="flex items-start justify-between gap-3 bg-[#2C2C2C] px-6 py-4">
          <div class="min-w-0">
            <h2 class="truncate text-lg font-bold text-white">{{ entity.title }}</h2>
            <div class="mt-1 truncate text-[11px] text-white/45">{{ entity.matterType }}</div>
            <div class="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">
              Matter 1.6 • {{ span.c }}×{{ span.r }}
            </div>
          </div>
          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/70 transition-colors hover:bg-white/[0.12] hover:text-white"
            aria-label="Zamknij"
            @click="closeModal"
          >
            <AppIcon name="X" :size="17" />
          </button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <section>
            <div class="mb-2.5 flex items-baseline justify-between gap-3">
              <h3 class="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
                Rozmiar kafelka na siatce (C × R)
              </h3>
              <span v-if="isSliderBasedEntity(entity)" class="text-[10px] text-white/35">
                Suwaki wymagają min. 2×
              </span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in sizeOptions"
                :key="`${option.c}x${option.r}`"
                type="button"
                class="h-9 rounded-full px-3.5 text-xs font-semibold tabular-nums transition-colors"
                :class="
                  isActiveSize(option)
                    ? 'bg-[#73B7B2] text-[#182C2A]'
                    : 'bg-white/[0.06] text-white/75 hover:bg-white/[0.12]'
                "
                @click="setSpan(entity, option)"
              >
                {{ option.c }}×{{ option.r }}
              </button>
            </div>
          </section>

          <section class="mt-6">
            <h3 class="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Widoczne strzałki rozwijania na kafelku
            </h3>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="option in expanderOptions"
                :key="option.key"
                type="button"
                class="flex flex-col items-start gap-1 rounded-2xl p-3 text-left transition-colors"
                :class="
                  entity.expanders[option.key]
                    ? 'bg-[#73B7B2]/15 text-[#73B7B2] ring-1 ring-inset ring-[#73B7B2]/30'
                    : 'bg-white/[0.05] text-white/75 hover:bg-white/[0.09]'
                "
                @click="toggleExpander(entity, option.key)"
              >
                <AppIcon :name="option.icon" :size="16" />
                <span class="text-[11px] font-semibold leading-tight">{{ option.label }}</span>
                <span class="text-[9px] leading-tight text-current opacity-50">{{ option.sub }}</span>
              </button>
            </div>
          </section>

          <section class="mt-6">
            <h3 class="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Co pokazywać po rozwinięciu kafelka
            </h3>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="option in expandedOptions"
                :key="option.key"
                type="button"
                class="flex flex-col items-start gap-1 rounded-2xl p-3 text-left transition-colors"
                :class="
                  entity.expandedContent[option.key]
                    ? 'bg-[#73B7B2]/15 text-[#73B7B2] ring-1 ring-inset ring-[#73B7B2]/30'
                    : 'bg-white/[0.05] text-white/75 hover:bg-white/[0.09]'
                "
                @click="toggleExpandedContent(entity, option.key)"
              >
                <span class="text-[11px] font-semibold leading-tight">{{ option.label }}</span>
                <span class="text-[9px] leading-tight text-current opacity-50">{{ option.sub }}</span>
              </button>
            </div>
          </section>

          <section v-if="otherEntities.length" class="mt-6">
            <h3 class="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Połącz lub zagnieźdź z innym kafelkiem w tym pokoju
            </h3>
            <div class="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
              <button
                v-for="other in otherEntities"
                :key="other.id"
                type="button"
                class="flex h-8 max-w-full items-center gap-1.5 rounded-full bg-white/[0.06] px-3 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/[0.12]"
                @click="requestCompose(entity.id, other.id)"
              >
                <AppIcon name="ArrowRight" :size="12" class="shrink-0 text-[#73B7B2]" />
                <span class="truncate">{{ other.title }}</span>
              </button>
            </div>
          </section>

          <section v-if="nestedEntities.length" class="mt-6">
            <h3 class="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Zagnieżdżone kafelki
            </h3>
            <div class="space-y-2">
              <div
                v-for="nested in nestedEntities"
                :key="nested.id"
                class="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.05] px-3.5 py-2.5"
              >
                <span class="flex min-w-0 items-center gap-2 text-xs text-white/85">
                  <AppIcon :name="nested.icon" :type="nested.iconType" :size="14" class="shrink-0 text-[#73B7B2]" />
                  <span class="truncate">{{ nested.title }}</span>
                </span>
                <button
                  type="button"
                  class="shrink-0 text-[11px] font-semibold text-[#73B7B2] hover:underline"
                  @click="unnestTile(entity, nested.id)"
                >
                  Wypnij z powrotem na siatkę
                </button>
              </div>
            </div>
          </section>

          <section class="mt-6">
            <h3 class="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Stan JSON kafelka (Matter 1.6 Endpoint)
            </h3>
            <pre
              class="max-h-64 overflow-auto rounded-2xl bg-[#181818] p-3.5 text-[11px] leading-relaxed text-teal-200/90"
            >{{ jsonState }}</pre>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>
