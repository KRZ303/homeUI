<script setup lang="ts">
import { useHomeStore } from '../store';

const store = useHomeStore();
</script>

<template>
  <div class="fixed bottom-3 right-3 z-40 flex flex-col items-end gap-2 pointer-events-none">
    <div
      v-for="t in store.toasts.value"
      :key="t.id"
      class="bg-[#252525] text-white/90 text-xs font-medium px-4 py-2.5 rounded-full shadow-lg max-w-[360px] truncate"
    >
      {{ t.text }}
    </div>
  </div>
</template>
