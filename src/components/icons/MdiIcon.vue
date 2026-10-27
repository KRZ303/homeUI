<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  size?: number
  class?: string
}>()

const size = computed(() => props.size ?? 18)

interface MdiPath {
  d?: string
  stroke?: boolean
  dots?: Array<{ x: number; y: number }>
}

const REGISTRY: Record<string, MdiPath> = {
  'floor-lamp': { d: 'M15 2L17 9H7L9 2H15M11 10H13V20H16V22H8V20H11V10Z' },
  mushroom: {
    d: 'M12 2C6.5 2 2 6.5 2 12H22C22 6.5 17.5 2 12 2M9 6.5C8.2 6.5 7.5 5.8 7.5 5S8.2 3.5 9 3.5 10.5 4.2 10.5 5 9.8 6.5 9 6.5M15.5 8C14.4 8 13.5 7.1 13.5 6S14.4 4 15.5 4 17.5 4.9 17.5 6 16.6 8 15.5 8M9 14H15V20C15 21.1 14.1 22 13 22H11C9.9 22 9 21.1 9 20V14Z',
  },
  'led-strip': {
    d: 'M3 8.5L20 4.5M3 13L20 9M4 19.5L21 15.5',
    stroke: true,
    dots: [
      { x: 7, y: 9.8 },
      { x: 12, y: 8.6 },
      { x: 17, y: 7.5 },
    ],
  },
  'movie-check': {
    d: 'M18 4L20 8H17L15 4H13L15 8H12L10 4H8L10 8H7L5 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H13.1C13 19.7 13 19.3 13 19C13 15.7 15.7 13 19 13C20.1 13 21.1 13.3 22 13.8V6C22 4.9 21.1 4 20 4H18M17.8 22L15 19.2L16.4 17.8L17.8 19.2L21.6 15.4L23 16.8L17.8 22Z',
  },
  'pendant-lamps': {
    d: 'M7 2H9V7L12 12H4L7 7V2M15 4H17V10L20 15H12L15 10V4M6.5 13.5H9.5C9.5 14.3 8.8 15 8 15S6.5 14.3 6.5 13.5M14.5 16.5H17.5C17.5 17.3 16.8 18 16 18S14.5 17.3 14.5 16.5Z',
  },
  'bulbs-off': {
    d: 'M2.3 1.7L1 3L5.1 7.1C4.4 8.2 4 9.6 4 11C4 13.8 5.6 16.2 8 17.4V20C8 20.6 8.4 21 9 21H15C15.4 21 15.7 20.8 15.9 20.5L19.7 24.3L21 23L2.3 1.7M12 4C9.8 4 7.9 5 6.6 6.5L16.7 16.6C18.1 15.2 19 13.2 19 11C19 7.1 15.9 4 12 4Z',
  },
  'office-chair': {
    d: 'M9 2C7.9 2 7 2.9 7 4V11C7 12.1 7.9 13 9 13H11V16H6V14H4V17C4 17.6 4.4 18 5 18H11V20H8V22H16V20H13V18H19C19.6 18 20 17.6 20 17V14H18V16H13V13H15C16.1 13 17 12.1 17 11V4C17 2.9 16.1 2 15 2H9Z',
  },
  'table-lamp': { d: 'M8 2H16L19 11H5L8 2M11 12H13V19H17V21H7V19H11V12Z' },
  'window-shutter': {
    d: 'M3 4H21V8H19V20H17V8H7V20H5V8H3V4M8 9H16V11H8V9M8 12H16V14H8V12M8 15H16V17H8V15M8 18H16V20H8V18Z',
  },
  'plug-off': {
    d: 'M2.3 1.7L1 3L6 8V12C6 14.8 7.9 17.1 10.5 17.8V21H13.5V17.8C14.3 17.6 15.1 17.2 15.7 16.7L20.7 21.7L22 20.4L2.3 1.7M16 8V3H14V8H11.8L18 14.2C18 13.5 18 12 18 12V8H16M10 3H8V5.2L10 7.2V3Z',
  },
  'ac-swing': {
    d: 'M4 4H20C21.1 4 22 4.9 22 6V12C22 13.1 21.1 14 20 14H4C2.9 14 2 13.1 2 12V6C2 4.9 2.9 4 4 4M5 10V12H19V10H5M8 16L6 20H8L10 16H8M12 16V21H14V16H12M16 16L18 20H20L18 16H16Z',
  },
  ionizer: {
    d: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15 24 12.36 21.95 10.22 19.35 10.04M11 19V15H8L13 8V12H16L11 19Z',
  },
  'door-closed': { d: 'M16 11H18V13H16V11M12 3H19C20.1 3 21 3.9 21 5V19H22V21H2V19H10V5C10 3.9 10.9 3 12 3M12 5V19H19V5H12Z' },
  'washing-machine': {
    d: 'M6 2H18C19.1 2 20 2.9 20 4V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2M6 4V6H8V4H6M10 4V6H12V4H10M12 9C9.2 9 7 11.2 7 14S9.2 19 12 19 17 16.8 17 14 14.8 9 12 9M12 11C13.7 11 15 12.3 15 14S13.7 17 12 17 9 15.7 9 14 10.3 11 12 11Z',
  },
  fridge: {
    d: 'M7 2H17C18.1 2 19 2.9 19 4V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V4C5 2.9 5.9 2 7 2M7 4V10H17V4H7M7 12V20H17V12H7M8 6H10V9H8V6M8 14H10V18H8V14Z',
  },
  oven: {
    d: 'M4 2H20C21.1 2 22 2.9 22 4V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V4C2 2.9 2.9 2 4 2M6 5C5.4 5 5 5.4 5 6S5.4 7 6 7 7 6.6 7 6 6.6 5 6 5M10 5C9.4 5 9 5.4 9 6S9.4 7 10 7 11 6.6 11 6 10.6 5 10 5M18 5C17.4 5 17 5.4 17 6S17.4 7 18 7 19 6.6 19 6 18.6 5 18 5M5 9V19H19V9H5M7 11H17V17H7V11Z',
  },
  'robot-vacuum': {
    d: 'M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 4C15.7 4 18.9 6.6 19.7 10H4.3C5.1 6.6 8.3 4 12 4M12 7C11.4 7 11 7.4 11 8S11.4 9 12 9 13 8.6 13 8 12.6 7 12 7M4 12H20C20 16.4 16.4 20 12 20S4 16.4 4 12Z',
  },
  'solar-panel': {
    d: 'M4 3H20C21.1 3 22 3.9 22 5V15C22 16.1 21.1 17 20 17H13V20H16V22H8V20H11V17H4C2.9 17 2 16.1 2 15V5C2 3.9 2.9 3 4 3M4 5V9H11V5H4M13 5V9H20V5H13M4 11V15H11V11H4M13 11V15H20V11H13Z',
  },
}

const path = computed(() => REGISTRY[props.name] ?? REGISTRY['circle'] ?? { d: '' })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="shrink-0"
    :class="props.class"
  >
    <path
      v-if="path.d"
      :d="path.d"
      :fill="path.stroke ? 'none' : 'currentColor'"
      :stroke="path.stroke ? 'currentColor' : 'none'"
      stroke-width="1.7"
      :stroke-linecap="path.stroke ? 'round' : undefined"
    />
    <circle
      v-for="(dot, index) in path.dots ?? []"
      :key="index"
      :cx="dot.x"
      :cy="dot.y"
      r="1.25"
      fill="currentColor"
    />
  </svg>
</template>
