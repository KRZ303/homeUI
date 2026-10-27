<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Device, TileButton } from '../types'
import AppIcon from './AppIcon.vue'

const props = withDefaults(defineProps<{
  device: Device
  subtitle: string
  iconName?: string
  iconType?: 'lucide' | 'mdi'
  iconClass?: string
  buttons?: TileButton[]
  trackMode?: 'none' | 'slider' | 'progress'
  trackActive?: boolean
  trackPct?: number
  trackClass?: string
}>(), {
  iconClass: '', buttons: () => [], trackMode: 'none', trackActive: false, trackPct: 0, trackClass: '',
})
const emit = defineEmits<{ icon: []; button: [button: TileButton] }>()
const open = ref(false)
const capped = computed(() => props.buttons.slice(0, 4))
const capacity = computed(() => props.device.span.c >= 4 ? 4 : props.device.span.c === 3 ? 2 : props.device.span.c === 2 ? 1 : 0)
const collapsed = computed(() => capped.value.length > capacity.value)
const visible = computed(() => collapsed.value ? [] : capped.value)
const fillStyle = computed(() => ({
  width: props.trackActive ? `calc(52px + (100% - 52px) * ${Math.max(0, Math.min(100, props.trackPct)) / 100})` : '0px',
}))
function activate(button: TileButton) {
  open.value = false
  emit('button', button)
}
</script>

<template>
  <div class="top-row">
    <div v-if="trackMode !== 'none'" class="track-capsule" :class="trackClass" aria-hidden="true">
      <div class="track-fill" :style="fillStyle">
        <span v-if="trackMode === 'slider' && trackActive" class="track-thumb" />
      </div>
    </div>
    <button class="device-icon" :class="iconClass" :aria-label="`${device.title}: wykonaj akcję`" @pointerdown.stop @click.stop="emit('icon')">
      <AppIcon :name="iconName || device.icon || device.iconName" :type="iconType || device.iconType" />
    </button>
    <div class="tile-copy">
      <strong>{{ device.title }}</strong>
      <span v-if="subtitle">{{ subtitle }}</span>
    </div>
    <div v-if="capped.length" class="main-actions">
      <template v-if="!collapsed">
        <button v-for="button in visible" :key="button.id" class="pill main-pill" :class="[{ active: button.active, over: trackMode !== 'none', labelled: button.showLabel }]" :title="button.label" :aria-label="button.label" :aria-pressed="!!button.active" @pointerdown.stop @click.stop="activate(button)">
          <AppIcon :name="button.icon" :type="button.iconType" :size="15" />
          <span v-if="button.showLabel">{{ button.label }}</span>
        </button>
      </template>
      <div v-else class="dropdown">
        <button class="dropdown-trigger" :aria-label="`${capped.length} przyciski główne`" :aria-expanded="open" @pointerdown.stop @click.stop="open = !open">
          <AppIcon :name="capped[0].icon" :type="capped[0].iconType" :size="15" />
          <span>{{ capped.length }}</span><AppIcon name="ChevronDown" :size="13" />
        </button>
        <div v-if="open" class="dropdown-menu">
          <button v-for="button in capped" :key="button.id" class="pill main-pill labelled" :class="[{ active: button.active, over: trackMode !== 'none' }]" @pointerdown.stop @click.stop="activate(button)">
            <AppIcon :name="button.icon" :type="button.iconType" :size="15" /><span>{{ button.label }}</span>
            <AppIcon v-if="button.active" name="Check" :size="13" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
