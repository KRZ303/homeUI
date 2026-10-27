<script setup lang="ts">
import { home } from '../stores/home'
</script>

<template>
  <div class="pointer-events-none fixed right-4 top-4 z-[70] flex flex-col items-end gap-2">
    <div
      v-for="toast in home.toasts"
      :key="toast.id"
      class="max-w-xs rounded-2xl bg-[#73B7B2] px-4 py-2.5 text-[12px] font-semibold leading-snug text-[#182C2A] shadow-xl"
    >
      {{ toast.text }}
    </div>
  </div>
</template>
