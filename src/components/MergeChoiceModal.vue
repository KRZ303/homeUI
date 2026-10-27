<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { home, executeRuleAGroupTogether, executeRuleAAddAsSecondaryButton } from '../stores/home'

const pending = computed(() => home.pendingMerge)
const source = computed(() => (pending.value ? home.entities[pending.value.sourceId] : null))
const target = computed(() => (pending.value ? home.entities[pending.value.targetId] : null))

function close(): void {
  home.pendingMerge = null
}
</script>

<template>
  <div
    v-if="pending && source && target"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
    @click="close"
  >
    <div
      class="w-full max-w-md overflow-hidden rounded-[32px] bg-[#252525] shadow-2xl"
      @click.stop
    >
      <div class="flex items-start justify-between gap-3 bg-[#2C2C2C] px-6 py-4">
        <div>
          <div class="text-base font-bold text-white">Połącz kafelki</div>
          <div class="mt-0.5 text-[12px] text-white/60">
            „{{ source.title }}” → „{{ target.title }}”
          </div>
        </div>
        <button
          type="button"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/70 transition-colors hover:bg-white/[0.12]"
          @click="close"
        >
          <X :size="15" />
        </button>
      </div>

      <div class="flex flex-col gap-2.5 p-5">
        <button
          type="button"
          class="rounded-2xl bg-[#73B7B2] px-5 py-4 text-left text-sm font-bold text-[#182C2A] transition-transform active:scale-[0.98]"
          @click="executeRuleAGroupTogether"
        >
          Zgrupuj i steruj razem
          <div class="mt-1 text-xs font-medium opacity-80">
            Scala oba urządzenia w jeden kafelek (zachowuje szerokość gospodarza, min. 2 kolumny).
          </div>
        </button>
        <button
          type="button"
          class="rounded-2xl bg-white/[0.06] px-5 py-4 text-left text-sm font-bold text-white/90 transition-colors hover:bg-white/[0.1]"
          @click="executeRuleAAddAsSecondaryButton"
        >
          Dodaj jako przycisk dodatkowy (Secondary button)
          <div class="mt-1 text-xs font-medium text-white/60">
            Zamienia źródło w przycisk w dolnym pasku (Row 2+) i rozszerza kafelek do min. 2×2.
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
