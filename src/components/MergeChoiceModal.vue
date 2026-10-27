<script setup lang="ts">
import { computed } from 'vue'
import { executeRuleAAddAsSecondaryButton, executeRuleAGroupTogether, home } from '../stores/home'
import { effectiveSpan } from '../utils/tile'
import AppIcon from './icons/AppIcon.vue'

const source = computed(() =>
  home.pendingMerge ? home.entities[home.pendingMerge.sourceId] : null,
)
const target = computed(() =>
  home.pendingMerge ? home.entities[home.pendingMerge.targetId] : null,
)
const targetSpan = computed(() => (target.value ? effectiveSpan(target.value) : { c: 2, r: 1 }))

function cancel(): void {
  home.pendingMerge = null
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="source && target"
      class="ets-backdrop-in fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      @click.self="cancel"
    >
      <div
        role="dialog"
        aria-modal="true"
        class="ets-modal-in w-full max-w-md overflow-hidden rounded-[32px] bg-[#252525] p-6 shadow-2xl"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-bold text-white">Połącz kafelki</h2>
            <p class="mt-1 text-xs text-white/45">
              „{{ source.title }}” → „{{ target.title }}”
            </p>
          </div>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/70 hover:bg-white/[0.12] hover:text-white"
            aria-label="Anuluj"
            @click="cancel"
          >
            <AppIcon name="X" :size="17" />
          </button>
        </div>

        <div class="mt-5 space-y-2.5">
          <button
            type="button"
            class="flex w-full items-start gap-3 rounded-2xl bg-white/[0.05] p-4 text-left transition-colors hover:bg-white/[0.09]"
            @click="executeRuleAGroupTogether"
          >
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#73B7B2]/15 text-[#73B7B2]">
              <AppIcon name="Layers" :size="18" />
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-semibold text-white">Zgrupuj i steruj razem</span>
              <span class="mt-1 block text-[11px] leading-relaxed text-white/45">
                Zachowuje szerokość {{ targetSpan.c }}×{{ targetSpan.r }} (minimum 2 kolumny) i nigdy
                nie zwęża szerszego kafelka.
              </span>
            </span>
          </button>

          <button
            type="button"
            class="flex w-full items-start gap-3 rounded-2xl bg-white/[0.05] p-4 text-left transition-colors hover:bg-white/[0.09]"
            @click="executeRuleAAddAsSecondaryButton"
          >
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-white/75">
              <AppIcon name="Plus" :size="18" />
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-semibold text-white">Dodaj jako przycisk dodatkowy</span>
              <span class="mt-1 block text-[11px] leading-relaxed text-white/45">
                Tworzy pill w dolnym pasku (Row 2+) i rozszerza kafelek do co najmniej 2×2.
              </span>
            </span>
          </button>
        </div>

        <button
          type="button"
          class="mt-4 w-full rounded-full py-2.5 text-xs font-semibold text-white/45 transition-colors hover:text-white/80"
          @click="cancel"
        >
          Anuluj
        </button>
      </div>
    </div>
  </Teleport>
</template>
