<script setup lang="ts">
import { home } from '../stores/home'
</script>

<template>
  <div
    class="pointer-events-none fixed bottom-16 left-1/2 z-[60] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-4"
  >
    <div
      v-for="toast in home.toasts"
      :key="toast.id"
      class="ets-toast rounded-full border border-white/10 bg-[#2C2C2C]/95 px-4 py-2 text-center text-[11px] font-medium text-white/90 shadow-xl backdrop-blur-md"
    >
      {{ toast.text }}
    </div>
  </div>
</template>
