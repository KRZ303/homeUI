<script setup lang="ts">
import { computed } from 'vue';
import { useHomeStore } from '../store';

const store = useHomeStore();
const choice = computed(() => store.pendingMergeChoice.value);
const targetTitle = computed(() => (choice.value ? store.entities[choice.value.targetId]?.title ?? '' : ''));
const sourceTitle = computed(() => (choice.value ? store.entities[choice.value.sourceId]?.title ?? '' : ''));
</script>

<template>
  <div
    v-if="choice"
    class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
    @pointerdown.self="store.cancelMergeChoice"
  >
    <div class="w-full max-w-md bg-[#252525] rounded-[32px] shadow-2xl overflow-hidden">
      <div class="bg-[#2C2C2C] px-6 py-4">
        <div class="text-base font-bold text-white">Rule A: {{ sourceTitle }} → {{ targetTitle }}</div>
        <div class="text-[11px] text-white/50 mt-0.5">Wybierz, jak połączyć oba kafelki (szerokość celu jest zachowywana).</div>
      </div>
      <div class="p-4 flex flex-col gap-2">
        <button
          class="h-12 px-5 rounded-full bg-[#73B7B2] hover:bg-[#64a8a3] text-[#182C2A] font-bold text-sm transition-colors text-left"
          @click="store.applyCloseLabel('group')"
        >
          Zgrupuj i steruj razem
          <span class="block text-[11px] font-medium opacity-70">Łączy w jeden kafelek; min. 2 kolumny, bez zmniejszania celu</span>
        </button>
        <button
          class="h-12 px-5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-sm transition-colors text-left"
          @click="store.applyCloseLabel('secondary')"
        >
          Dodaj jako przycisk dodatkowy (Secondary button)
          <span class="block text-[11px] font-medium text-white/50">Docelowy kafelek rośnie do min. 2×2</span>
        </button>
        <button class="h-10 text-xs text-white/50 hover:text-white/80" @click="store.cancelMergeChoice">Anuluj</button>
      </div>
    </div>
  </div>
</template>
