<script setup lang="ts">
import { useHomeStore } from '../store';

const store = useHomeStore();
</script>

<template>
  <div
    class="fixed bottom-3 left-4 z-40 flex gap-2 rounded-2xl bg-[#1F1F1F]/80 px-3 py-2 text-xs font-semibold text-neutral-300 backdrop-blur-md border border-white/10"
  >
    <button
      class="px-3 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.16] transition-colors"
      @click="store.orientation.value = store.orientation.value === 'portrait' ? 'landscape' : 'portrait'"
    >
      {{ store.orientation.value === 'portrait' ? 'Ikona = Akcja • Kafelek = Modal • Przesuń pokój' : 'Landscape (Nest Hub)' }}
    </button>
    <button
      v-if="store.orientation.value === 'portrait'"
      class="px-3 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.16] transition-colors"
      @click="store.portraitTitlePos.value = store.portraitTitlePos.value === 'top' ? 'left' : 'top'"
    >
      {{ store.portraitTitlePos.value === 'top' ? 'Tytuł pokoju: U góry' : 'Tytuł pokoju: Po lewej' }}
    </button>
    <button class="px-3 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.16] transition-colors" @click="store.resetPrototype">
      Resetuj
    </button>
  </div>
</template>
