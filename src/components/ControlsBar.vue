<script setup lang="ts">
import {
  home,
  resetAll,
  setOrientation,
  setPortraitTitlePos,
} from '../stores/home'
import AppIcon from './icons/AppIcon.vue'
</script>

<template>
  <div
    class="fixed bottom-3 left-4 z-40 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-1.5 rounded-full border border-white/10 bg-black/55 p-1.5 shadow-lg backdrop-blur-md"
  >
    <button
      type="button"
      class="flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-colors"
      :class="
        home.orientation === 'portrait'
          ? 'bg-[#73B7B2] text-[#182C2A]'
          : 'text-white/60 hover:bg-white/[0.07] hover:text-white'
      "
      @click="setOrientation('portrait')"
    >
      <AppIcon name="Tablet" :size="14" />
      <span class="hidden sm:inline">Portret</span>
    </button>

    <button
      type="button"
      class="flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-colors"
      :class="
        home.orientation === 'landscape'
          ? 'bg-[#73B7B2] text-[#182C2A]'
          : 'text-white/60 hover:bg-white/[0.07] hover:text-white'
      "
      @click="setOrientation('landscape')"
    >
      <AppIcon name="Monitor" :size="14" />
      <span class="hidden sm:inline">Nest Hub</span>
    </button>

    <span class="mx-0.5 h-4 w-px bg-white/10" />

    <button
      v-if="home.orientation === 'portrait'"
      type="button"
      class="flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white"
      @click="setPortraitTitlePos(home.portraitTitlePos === 'top' ? 'left' : 'top')"
    >
      <AppIcon :name="home.portraitTitlePos === 'top' ? 'PanelTop' : 'PanelLeft'" :size="14" />
      <span class="hidden sm:inline">
        Tytuł: {{ home.portraitTitlePos === 'top' ? 'u góry' : 'po lewej' }}
      </span>
    </button>

    <button
      type="button"
      class="flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white"
      @click="resetAll"
    >
      <AppIcon name="RotateCcw" :size="14" />
      <span class="hidden sm:inline">Resetuj</span>
    </button>
  </div>
</template>
