<script setup lang="ts">
import type { Component } from 'vue'
import {
  Activity, AlertTriangle, ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUp,
  ArrowUpLeft, BatteryCharging, Bed, Bell, Building2, Camera, Car, Check, ChevronDown,
  ChevronRight, Circle, CirclePlus, Clock, Cloud, Combine, Compass, CornerDownRight,
  Droplets, Eye, EyeOff, Fan, Flame, GalleryHorizontal, Gauge, Group, History, Home,
  Lightbulb, Lock, Minus, Moon, PanelLeft, PanelsTopLeft, Pause, Play, Plug, Plus,
  Power, Radio, RotateCcw, Shield, Snowflake, Sofa, Sparkles, Sprout, Square, Sun,
  Thermometer, Tv, Unlock, Utensils, Volume2, Waves, Wifi, Wind, X, Zap,
} from '@lucide/vue'
import {
  mdiFloorLamp, mdiMushroom, mdiLedStrip, mdiMovieOpenCheck, mdiLightbulbMultiple,
  mdiLightbulbGroupOff, mdiChairRolling, mdiDeskLamp, mdiWindowShutter, mdiPowerPlugOff,
  mdiAirConditioner, mdiLightningBolt, mdiDoorClosed, mdiWashingMachine, mdiFridgeOutline,
  mdiStove, mdiRobotVacuum, mdiSolarPanel, mdiCarElectric,
} from '@mdi/js'

withDefaults(defineProps<{ name?: string; type?: 'lucide' | 'mdi'; size?: number; strokeWidth?: number }>(), {
  name: 'Circle', type: 'lucide', size: 20, strokeWidth: 1.8,
})
const paths: Record<string, string> = {
  'floor-lamp': mdiFloorLamp, mushroom: mdiMushroom, 'led-strip': mdiLedStrip,
  'movie-check': mdiMovieOpenCheck, 'pendant-lamps': mdiLightbulbMultiple,
  'bulbs-off': mdiLightbulbGroupOff, 'office-chair': mdiChairRolling,
  'table-lamp': mdiDeskLamp, 'window-shutter': mdiWindowShutter,
  'plug-off': mdiPowerPlugOff, 'ac-swing': mdiAirConditioner, ionizer: mdiLightningBolt,
  'door-closed': mdiDoorClosed, 'washing-machine': mdiWashingMachine,
  fridge: mdiFridgeOutline, oven: mdiStove, 'robot-vacuum': mdiRobotVacuum,
  'solar-panel': mdiSolarPanel, 'ev-car': mdiCarElectric,
}
const lucideIcons: Record<string, Component> = {
  Activity, AlertTriangle, ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUp,
  ArrowUpLeft, BatteryCharging, Bed, Bell, Building2, Camera, Car, Check, ChevronDown,
  ChevronRight, Circle, CirclePlus, Clock, Cloud, Combine, Compass, CornerDownRight,
  Droplets, Eye, EyeOff, Fan, Flame, GalleryHorizontal, Gauge, Group, History, Home,
  Lightbulb, Lock, Minus, Moon, PanelLeft, PanelsTopLeft, Pause, Play, Plug, Plus,
  Power, Radio, RotateCcw, Shield, Snowflake, Sofa, Sparkles, Sprout, Square, Sun,
  Thermometer, Tv, Unlock, Utensils, Volume2, Waves, Wifi, Wind, X, Zap,
}
const lucide = (name?: string) => lucideIcons[name || 'Circle'] || Circle
</script>

<template>
  <svg v-if="type === 'mdi' || paths[name || '']" viewBox="0 0 24 24" :width="size" :height="size" fill="currentColor" aria-hidden="true">
    <path :d="paths[name || ''] || mdiLightningBolt" />
  </svg>
  <component :is="lucide(name)" v-else :size="size" :stroke-width="strokeWidth" aria-hidden="true" />
</template>
