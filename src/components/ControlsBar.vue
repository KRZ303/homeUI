<script setup lang="ts">
import { MonitorSmartphone, RotateCcw, Type } from 'lucide-vue-next'
import { home, reset } from '../stores/home'

function toggleOrientation(): void {
  home.orientation = home.orientation === 'portrait' ? 'landscape' : 'portrait'
}

function toggleTitlePos(): void {
  home.portraitTitlePos = home.portraitTitlePos === 'top' ? 'left' : 'top'
}
</script>

<template>
  <div class="fixed bottom-3 left-4 z-40 flex flex-wrap items-center gap-2">
    <button
      type="button"
      class="flex items-center gap-2 rounded-full border border-white/10 bg-[#303030]/90 px-3.5 py-2 text-[11px] font-semibold text-white/85 shadow-lg backdrop-blur-md transition-colors hover:bg-[#3a3a3a]"
      @click="toggleOrientation"
    >
      <MonitorSmartphone :size="13" class="text-[#73B7B2]" />
      {{ home.orientation === 'portrait' ? 'Portrait (Ikona = Akcja • Kafelek = Modal • Przesuń pokój)' : 'Landscape (Nest Hub)' }}
    </button>

    <button
      v-if="home.orientation === 'portrait'"
      type="button"
      class="flex items-center gap-2 rounded-full border border-white/10 bg-[#303030]/90 px-3.5 py-2 text-[11px] font-semibold text-white/85 shadow-lg backdrop-blur-md transition-colors hover:bg-[#3a3a3a]"
      @click="toggleTitlePos"
    >
      <Type :size="13" class="text-[#73B7B2]" />
      {{ home.portraitTitlePos === 'top' ? 'Tytuł pokoju: U góry' : 'Tytuł pokoju: Po lewej' }}
    </button>

    <button
      type="button"
      class="flex items-center gap-2 rounded-full border border-white/10 bg-[#303030]/90 px-3.5 py-2 text-[11px] font-semibold text-white/85 shadow-lg backdrop-blur-md transition-colors hover:bg-[#3a3a3a]"
      @click="reset"
    >
      <RotateCcw :size="13" class="text-[#73B7B2]" />
      Resetuj
    </button>
  </div>
</template>
