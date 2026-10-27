<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import type { Entity, Span } from '../types'
import {
  closeModal,
  home,
  requestCompose,
  setSpan,
  toggleExpandedContent,
  toggleExpander,
  unnestTile,
} from '../stores/home'
import { isSliderBasedEntity } from '../utils/tile'

const props = defineProps<{ entity: Entity }>()

const span = computed(() => props.entity.span)

const allowedSizes = computed<Span[]>(() => {
  if (props.entity.type === 'vertical_blind') {
    return [
      { c: 2, r: 3 },
      { c: 3, r: 3 },
      { c: 4, r: 3 },
    ]
  }
  if (isSliderBasedEntity(props.entity)) {
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

const laneEntities = computed(() => {
  const lane = home.lanes.find((candidate) => candidate.id === props.entity.column)
  return (lane?.entityIds ?? [])
    .map((id) => home.entities[id])
    .filter((candidate): candidate is Entity => Boolean(candidate) && candidate.id !== props.entity.id)
})

const nestedEntities = computed(() =>
  (props.entity.nestedTiles ?? [])
    .map((id) => home.entities[id])
    .filter((candidate): candidate is Entity => Boolean(candidate)),
)

function isCurrent(spanOption: Span): boolean {
  return span.value.c === spanOption.c && span.value.r === spanOption.r
}

function pickSize(spanOption: Span): void {
  setSpan(props.entity, spanOption)
}

const toggleClass = (active: boolean) =>
  active ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.1]'
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
    @click="closeModal"
  >
    <div
      class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[32px] bg-[#252525] shadow-2xl"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-3 bg-[#2C2C2C] px-6 py-4">
        <div class="min-w-0">
          <div class="truncate text-lg font-bold text-white">{{ entity.title }}</div>
          <div class="mt-0.5 truncate text-[11px] text-white/50">{{ entity.matterType }}</div>
          <div class="mt-1 inline-block rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-white/75">
            {{ span.c }}×{{ span.r }}
          </div>
        </div>
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/70 transition-colors hover:bg-white/[0.12]"
          @click="closeModal"
        >
          <X :size="17" />
        </button>
      </div>

      <!-- Body -->
      <div class="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <!-- Footprint selector -->
        <section>
          <div class="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/45">
            Rozmiar kafelka na siatce (C × R)
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="option in allowedSizes"
              :key="`${option.c}x${option.r}`"
              type="button"
              class="rounded-full px-3.5 py-1.5 text-xs font-semibold tabular-nums transition-colors"
              :class="toggleClass(isCurrent(option))"
              @click="pickSize(option)"
            >
              {{ option.c }}×{{ option.r }}
            </button>
          </div>
          <div
            v-if="isSliderBasedEntity(entity)"
            class="mt-1.5 text-[10px] text-white/40"
          >
            • Suwaki wymagają min. szerokości 2× (C ≥ 2)
          </div>
        </section>

        <!-- Expander visibility toggles -->
        <section>
          <div class="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/45">
            Widoczne strzałki rozwijania na kafelku
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              class="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 transition-colors"
              :class="toggleClass(entity.expanders.down)"
              @click="toggleExpander(entity, 'down')"
            >
              <span class="text-sm font-semibold">W dół (↓)</span>
              <span class="text-[10px] leading-tight opacity-70">Środek na dole</span>
            </button>
            <button
              type="button"
              class="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 transition-colors"
              :class="toggleClass(entity.expanders.right)"
              @click="toggleExpander(entity, 'right')"
            >
              <span class="text-sm font-semibold">W bok (→)</span>
              <span class="text-[10px] leading-tight opacity-70">Środek po prawej</span>
            </button>
            <button
              type="button"
              class="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 transition-colors"
              :class="toggleClass(entity.expanders.diagonal)"
              @click="toggleExpander(entity, 'diagonal')"
            >
              <span class="text-sm font-semibold">Ukośnie (↘)</span>
              <span class="text-[10px] leading-tight opacity-70">Prawy dolny róg</span>
            </button>
          </div>
        </section>

        <!-- Expanded content toggles -->
        <section>
          <div class="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/45">
            Co pokazywać po rozwinięciu kafelka
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              class="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 transition-colors"
              :class="toggleClass(entity.expandedContent.secondaryButtons)"
              @click="toggleExpandedContent(entity, 'secondaryButtons')"
            >
              <span class="text-sm font-semibold">Przyciski dodatkowe</span>
              <span class="text-[10px] leading-tight opacity-70">Secondary buttons</span>
            </button>
            <button
              type="button"
              class="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 transition-colors"
              :class="toggleClass(entity.expandedContent.secondarySlider)"
              @click="toggleExpandedContent(entity, 'secondarySlider')"
            >
              <span class="text-sm font-semibold">Dodatkowy suwak</span>
              <span class="text-[10px] leading-tight opacity-70">Barwa K / Nawiew</span>
            </button>
            <button
              type="button"
              class="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl px-2 transition-colors"
              :class="toggleClass(entity.expandedContent.presets)"
              @click="toggleExpandedContent(entity, 'presets')"
            >
              <span class="text-sm font-semibold">Szybkie presety</span>
              <span class="text-[10px] leading-tight opacity-70">Tryby Eco / Komfort</span>
            </button>
          </div>
        </section>

        <!-- Quick composition -->
        <section>
          <div class="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/45">
            Połącz lub zagnieźdź z innym kafelkiem w tym pokoju
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="other in laneEntities"
              :key="other.id"
              type="button"
              class="rounded-full bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-white/85 transition-colors hover:bg-[#73B7B2]/25 hover:text-teal-100"
              @click="requestCompose(other.id, entity.id)"
            >
              → {{ other.title }}
            </button>
          </div>
        </section>

        <!-- Nested tiles manager -->
        <section v-if="nestedEntities.length">
          <div class="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/45">
            Zagnieżdżone kafelki
          </div>
          <div class="space-y-1.5">
            <div
              v-for="child in nestedEntities"
              :key="child.id"
              class="flex items-center justify-between gap-2 rounded-2xl bg-white/[0.05] px-3.5 py-2.5"
            >
              <span class="min-w-0 truncate text-[13px] font-semibold text-white/90">
                {{ child.title }}
              </span>
              <button
                type="button"
                class="shrink-0 text-xs font-semibold text-[#73B7B2] hover:underline"
                @click="unnestTile(entity, child.id)"
              >
                Wypnij z powrotem na siatkę
              </button>
            </div>
          </div>
        </section>

        <!-- Matter 1.6 JSON inspector -->
        <section>
          <div class="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/45">
            Stan JSON kafelka (Matter 1.6 Endpoint)
          </div>
          <pre
            class="overflow-x-auto rounded-2xl bg-[#181818] p-3.5 text-[11px] font-mono leading-relaxed text-teal-200/90"
          >{{ JSON.stringify(entity, null, 2) }}</pre>
        </section>
      </div>
    </div>
  </div>
</template>
