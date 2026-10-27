<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { Device, TileButton } from '../types'
import { useHome } from '../state/home'
import AppIcon from './AppIcon.vue'
import TileTopRow from './TileTopRow.vue'
import SensorGraph from './SensorGraph.vue'

const props = withDefaults(defineProps<{ device: Device; nested?: boolean }>(), { nested: false })
const emit = defineEmits<{ open: [device: Device] }>()
const { state, update, iconAction, expand, notify } = useHome()
const flashing = ref('')
const drag = reactive({ x: 0, y: 0, active: false })
const horizontalSlider = computed(() => ['slider_light', 'rich_ac_row', 'stateful_tv'].includes(props.device.type))
const anyMembers = computed(() => props.device.members?.some((member) => member.active) || false)
const activeMembers = computed(() => props.device.members?.filter((member) => member.active).length || 0)
const tileStyle = computed(() => {
  if (props.nested) return { gridColumn: '1 / -1', minHeight: '68px' }
  return {
    gridColumn: `span ${Math.min(4, props.device.span.c)}`,
    gridRow: `span ${props.device.span.r}`,
    minHeight: `${props.device.span.r === 1 ? 68 : props.device.span.r === 2 ? 140 : 216}px`,
  }
})
const subtitle = computed(() => {
  const d = props.device
  switch (d.type) {
    case 'slider_light': return d.on ? `${d.brightness}%${d.customSubtitle ? ` • ${d.customSubtitle}` : ''}${d.powerWatts ? ` • ${d.powerWatts}` : ''}` : 'wyłączono'
    case 'group_tile': return `${activeMembers.value}/${d.members?.length || 0} • ${d.soilMoisture || 'Aktywne'}`
    case 'scene_pill': return d.span.c === 1 ? '' : d.active ? 'aktywna' : 'scena'
    case 'vertical_blind': return `${d.position}% • Lamele ${d.tilt}°`
    case 'sensor_graph': return d.span.c >= 2 && d.span.r >= 2 ? 'Ostatnie 24h' : (d.series || []).slice(0, d.span.c >= 2 ? 2 : 1).map((s) => `${s.current} ${s.unit}`).join(' • ')
    case 'matter_context_tile': return d.active ? d.activity || '' : 'Czujnik prywatności wyciszony'
    case 'hvac_global_modes': return d.modes?.heat && d.modes.auto ? 'Grzanie + Auto' : d.modes?.cool ? 'Chłodzenie' : d.modes?.heat ? 'Grzanie' : 'Wyłączone'
    case 'simple_thermostat': return `${(d.targetTemp || 0).toFixed(1).replace('.', ',')} °C • ${d.demand}%`
    case 'rich_ac_row': return `${(d.measuredTemp || 0).toFixed(1).replace('.', ',')} °C → Cel ${(d.targetTemp || 0).toFixed(1).replace('.', ',')} °C`
    case 'stateful_tv': return d.on ? `${d.source} • Głośność ${d.volume}%` : 'wyłączono'
    case 'stateful_dishwasher': return d.state === 'idle' ? 'zamknięto • gotowe' : `${d.state === 'paused' ? 'Wstrzymano' : 'W trakcie'} • ${d.remainingMinutes} min (${d.progress}%)`
    case 'robot_vacuum_tile': return d.on ? `${d.mode} • Bateria ${d.battery}%` : `W stacji dokującej • ${d.battery}%`
    case 'webrtc_camera_tile': return d.privacy ? 'WebRTC wył.' : d.ptzPreset || ''
    case 'closure_lock_tile': return `${d.locked ? 'Zamknięte' : 'Otwarte'} • ${d.lastActor}`
    case 'matter_smoke_alarm': return d.mounted ? `Zamontowany w uchwycie • CO ${d.coPpm} ppm` : 'UWAGA: Zdjęto z uchwytu sufitowego!'
    case 'matter_event_history': return d.events?.length ? `${d.events[0].time} — ${d.events[0].label}` : 'Brak zdarzeń'
    case 'matter_fabric_hub': return `Thread 1.4 (${d.threadNodes} węzłów) • Wspólny Datastore`
    default: return ''
  }
})
const buttons = computed<TileButton[]>(() => {
  const d = props.device
  if (d.span.c === 1) return []
  if (d.mainButtons) return d.mainButtons
  if (d.type === 'hvac_global_modes') return [
    { id: 'cool', label: 'Chłodzenie', icon: 'Snowflake', active: d.modes?.cool },
    { id: 'auto', label: 'Auto', icon: 'Plug', active: d.modes?.auto },
    { id: 'heat', label: 'Grzanie', icon: 'Flame', active: d.modes?.heat },
  ]
  if (d.type === 'simple_thermostat') return [
    { id: 'minus', label: 'Obniż o 0,5°C', icon: 'Minus' }, { id: 'plus', label: 'Podwyższ o 0,5°C', icon: 'Plus' },
    ...(d.matterSuggestion ? [{ id: 'suggest', label: `Sugestia ${d.matterSuggestion.suggestedTemp}°C`, icon: 'Sparkles', active: true }] : []),
  ]
  if (d.type === 'rich_ac_row') return [
    { id: 'swing', label: 'Swing', icon: 'ac-swing', active: Boolean(d.swing) },
    { id: 'fan', label: 'Wentylator', icon: 'Fan', active: Boolean(d.fan) },
    { id: 'ionizer', label: 'Jonizacja', icon: 'ionizer', active: Boolean(d.ionizer) },
    { id: 'temperature', label: `${(d.targetTemp || 0).toFixed(1).replace('.', ',')}°C`, icon: 'Thermometer', active: d.on, showLabel: true },
  ]
  if (d.type === 'stateful_tv') return [
    { id: 'source', label: d.source || 'Netflix • 4K', icon: 'Tv', active: true, showLabel: true },
    { id: 'playing', label: d.playing ? 'Pauza' : 'Odtwarzaj', icon: d.playing ? 'Pause' : 'Play', active: d.playing },
    { id: 'power', label: 'Zasilanie', icon: 'Power', active: d.on },
  ]
  if (d.type === 'stateful_dishwasher') return d.state === 'idle' ? [
    { id: 'delay', label: `Start za ${d.delay}`, icon: 'Clock', showLabel: true }, { id: 'start', label: 'Start!', icon: 'Play', active: true, showLabel: true },
  ] : [
    { id: 'cycle', label: d.state === 'paused' ? 'Wznów' : 'Pauza', icon: d.state === 'paused' ? 'Play' : 'Pause', active: true, showLabel: true },
    { id: 'end', label: 'Zakończ', icon: 'Square', showLabel: true },
  ]
  if (d.type === 'robot_vacuum_tile') return (d.rooms || []).map((room) => ({ id: room, label: room, icon: 'Compass', showLabel: true }))
  if (d.type === 'webrtc_camera_tile') return [
    { id: 'ptz', label: 'Preset PTZ', icon: 'Compass' }, { id: 'privacy', label: 'Prywatność', icon: 'Eye', active: !d.privacy },
  ]
  if (d.type === 'matter_fabric_hub') return (d.ecosystems || []).map((name) => ({ id: name, label: name, icon: 'Wifi', active: true, showLabel: true }))
  return []
})
const iconName = computed(() => {
  const d = props.device
  if (d.type === 'closure_lock_tile') return d.locked ? 'Lock' : 'Unlock'
  if (d.type === 'webrtc_camera_tile') return d.privacy ? 'EyeOff' : 'Camera'
  if (d.type === 'matter_context_tile') return d.active ? 'Eye' : 'EyeOff'
  if (d.type === 'matter_smoke_alarm') return 'AlertTriangle'
  if (d.type === 'hvac_global_modes') return 'plug-off'
  if (d.type === 'matter_event_history') return 'History'
  if (d.type === 'matter_fabric_hub') return 'Radio'
  if (d.type === 'stateful_tv') return 'Tv'
  if (d.type === 'robot_vacuum_tile') return 'robot-vacuum'
  if (d.type === 'stateful_dishwasher') return d.iconName
  return d.icon || 'Circle'
})
const iconType = computed(() => props.device.iconName || props.device.type === 'hvac_global_modes' || props.device.type === 'robot_vacuum_tile' ? 'mdi' : props.device.iconType)
const iconClass = computed(() => {
  const d = props.device
  if (d.type === 'sensor_graph') return 'icon-sensor'
  if (d.type === 'group_tile') return anyMembers.value ? 'icon-group' : ''
  if (d.type === 'matter_smoke_alarm') return d.mounted ? 'icon-safe' : 'icon-warning'
  if (d.type === 'simple_thermostat') return d.demand ? 'icon-warm' : ''
  if (d.type === 'closure_lock_tile') return d.locked ? '' : 'icon-active'
  if (d.type === 'scene_pill') return d.active || flashing.value === d.id ? 'icon-active' : ''
  if (d.type === 'webrtc_camera_tile') return d.privacy ? 'icon-danger' : 'icon-active'
  if (d.type === 'matter_context_tile' || d.type === 'matter_fabric_hub') return d.active === false ? '' : 'icon-active'
  if (d.type === 'stateful_dishwasher') return d.state !== 'idle' ? 'icon-active' : ''
  return d.on || d.armed || (d.type === 'vertical_blind' && d.position) ? d.type === 'slider_light' ? 'icon-warm' : 'icon-active' : ''
})
const trackMode = computed<'none' | 'slider' | 'progress'>(() => {
  const d = props.device
  if (horizontalSlider.value) return 'slider'
  if (['group_tile', 'simple_thermostat', 'stateful_dishwasher', 'robot_vacuum_tile', 'closure_lock_tile', 'matter_smoke_alarm', 'scene_pill'].includes(d.type)) return 'progress'
  return 'none'
})
const trackPct = computed(() => {
  const d = props.device
  if (d.type === 'slider_light') return d.brightness || 0
  if (d.type === 'rich_ac_row') return d.fanSpeedPct || 0
  if (d.type === 'stateful_tv') return d.volume || 0
  if (d.type === 'group_tile') return activeMembers.value / (d.members?.length || 1) * 100
  if (d.type === 'simple_thermostat') return d.demand || 0
  if (d.type === 'closure_lock_tile') return d.position || 0
  if (d.type === 'matter_smoke_alarm' || d.type === 'scene_pill') return 100
  return d.progress || 0
})
const trackActive = computed(() => {
  const d = props.device
  if (d.type === 'group_tile') return anyMembers.value
  if (d.type === 'simple_thermostat') return Boolean(d.demand)
  if (d.type === 'stateful_dishwasher') return d.state !== 'idle'
  if (d.type === 'closure_lock_tile') return !d.locked
  if (d.type === 'matter_smoke_alarm') return !d.mounted
  if (d.type === 'scene_pill') return Boolean(d.active || flashing.value === d.id)
  return Boolean(d.on)
})
const trackClass = computed(() => {
  const d = props.device
  if (d.type === 'slider_light') return 'track-light'
  if (d.type === 'rich_ac_row') return 'track-ac'
  if (d.type === 'stateful_tv') return 'track-tv'
  if (d.type === 'simple_thermostat') return 'track-heat'
  if (d.type === 'closure_lock_tile') return 'track-closure'
  if (d.type === 'matter_smoke_alarm') return 'track-alert'
  return 'track-progress'
})
function mainAction(button: TileButton) {
  const d = props.device
  if (d.mainButtons?.includes(button)) { button.active = !button.active; return }
  if (d.type === 'hvac_global_modes' && d.modes) d.modes[button.id as keyof typeof d.modes] = !d.modes[button.id as keyof typeof d.modes]
  else if (d.type === 'simple_thermostat') {
    if (button.id === 'minus') update(d.id, { targetTemp: (d.targetTemp || 0) - 0.5 })
    if (button.id === 'plus') update(d.id, { targetTemp: (d.targetTemp || 0) + 0.5 })
    if (button.id === 'suggest' && d.matterSuggestion) update(d.id, { targetTemp: d.matterSuggestion.suggestedTemp })
  } else if (d.type === 'rich_ac_row') {
    if (button.id === 'temperature') update(d.id, { targetTemp: (d.targetTemp || 20) + 0.5 > 26 ? 18 : (d.targetTemp || 20) + 0.5 })
    else update(d.id, { [button.id]: !d[button.id] })
  } else if (d.type === 'stateful_tv') {
    if (button.id === 'source') update(d.id, { source: d.source?.startsWith('Netflix') ? 'PS5' : d.source === 'PS5' ? 'Matter Cast' : 'Netflix • 4K' })
    if (button.id === 'playing') update(d.id, { playing: !d.playing })
    if (button.id === 'power') update(d.id, { on: !d.on })
  } else if (d.type === 'stateful_dishwasher') {
    if (button.id === 'delay') {
      const options = ['0:00', '1:00', '2:00', '4:00']
      update(d.id, { delay: options[(options.indexOf(d.delay || '0:00') + 1) % options.length] })
    }
    if (button.id === 'start') update(d.id, { state: 'running', progress: 24, remainingMinutes: 82 })
    if (button.id === 'cycle') update(d.id, { state: d.state === 'paused' ? 'running' : 'paused' })
    if (button.id === 'end') update(d.id, { state: 'idle', progress: 0 })
  } else if (d.type === 'robot_vacuum_tile') update(d.id, { on: true, mode: `Sprzątanie: ${button.label}` })
  else if (d.type === 'webrtc_camera_tile') {
    if (button.id === 'privacy') update(d.id, { privacy: !d.privacy })
    else notify('Zmieniono preset kamery PTZ.')
  } else if (d.type === 'matter_fabric_hub') notify(`Zsynchronizowano klucze Joint Fabric z ${button.label}.`)
}
function primaryAction() {
  iconAction(props.device.id)
  if (props.device.type === 'scene_pill') {
    flashing.value = props.device.id
    setTimeout(() => { flashing.value = '' }, 650)
  }
}
function secondaryAction(button: TileButton) {
  if (button.type === 'ghost_momentary') {
    flashing.value = button.id
    setTimeout(() => { flashing.value = '' }, 650)
  }
  button.active = !button.active
}
function pointerDown(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('button, input')) return
  drag.x = event.clientX; drag.y = event.clientY; drag.active = false
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}
function pointerMove(event: PointerEvent) {
  if (!(event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) return
  const dx = event.clientX - drag.x
  const dy = event.clientY - drag.y
  if (horizontalSlider.value && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
    drag.active = true
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const value = Math.max(1, Math.min(100, Math.round((event.clientX - rect.left) / rect.width * 100)))
    if (props.device.type === 'slider_light') update(props.device.id, { brightness: value, on: true })
    if (props.device.type === 'rich_ac_row') update(props.device.id, { fanSpeedPct: value, on: true })
    if (props.device.type === 'stateful_tv') update(props.device.id, { volume: value, on: true })
  }
  if (props.device.type === 'vertical_blind' && Math.abs(dy) > 5) {
    drag.active = true
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    update(props.device.id, { position: Math.max(0, Math.min(100, Math.round(100 - (event.clientY - rect.top) / rect.height * 100))) })
  }
}
function pointerUp(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('button, input')) return
  if (!drag.active) emit('open', props.device)
  drag.active = false
}
function keyboardOpen(event: KeyboardEvent) {
  if (event.target !== event.currentTarget) return
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); emit('open', props.device) }
}
function cycleProgramme() {
  const options = ['Intensywny 70°C', 'Auto 45-65°C', 'Eco 50°C', 'Szybki 45°C']
  update(props.device.id, { programme: options[(options.indexOf(props.device.programme || '') + 1) % options.length] })
}
</script>

<template>
  <article class="device-tile" :class="[`type-${device.type}`, `span-c-${device.span.c}`, { nested, active: device.on || device.active, 'group-active': device.type === 'group_tile' && anyMembers, 'context-active': device.type === 'matter_context_tile' && device.active, vertical: device.type === 'vertical_blind' }]" :style="tileStyle" tabindex="0" :aria-label="`${device.title}. Otwórz konfigurację`" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="drag.active = true" @keydown="keyboardOpen">
    <div v-if="device.type === 'vertical_blind'" class="vertical-track" aria-hidden="true"><div :style="{ height: `calc(52px + (100% - 52px) * ${(device.position || 0) / 100})` }"><span /></div></div>
    <TileTopRow :device="device" :subtitle="subtitle" :icon-name="iconName" :icon-type="iconType" :icon-class="iconClass" :buttons="buttons" :track-mode="trackMode" :track-active="trackActive" :track-pct="trackPct" :track-class="trackClass" @icon="primaryAction" @button="mainAction" />

    <template v-if="device.type === 'sensor_graph'"><SensorGraph :device="device" /></template>
    <div v-else-if="device.type === 'vertical_blind'" class="blind-controls">
      <button class="pill" @click.stop="update(device.id, { position: 100 })"><AppIcon name="ArrowUp" :size="15" />Otwórz 100%</button>
      <button class="pill" @click.stop="update(device.id, { position: 50 })"><AppIcon name="Pause" :size="15" />Stop / 50%</button>
      <button class="pill" @click.stop="update(device.id, { position: 0 })"><AppIcon name="ArrowDown" :size="15" />Zamknij 0%</button>
      <label v-if="device.span.c >= 4" class="embedded-range"><span>Kąt lameli</span><input type="range" min="0" max="90" :value="device.tilt" @input="update(device.id, { tilt: Number(($event.target as HTMLInputElement).value) })"><b>{{ device.tilt }}°</b></label>
    </div>
    <div v-else-if="device.type === 'group_tile' && device.span.r >= 2" class="member-grid bottom-bar">
      <button v-for="member in device.members" :key="member.id" class="member-pill" :class="{ active: member.active }" :title="member.label" @pointerdown.stop @click.stop="member.active = !member.active"><AppIcon :name="member.icon" :type="member.iconType" :size="16" /><span v-if="device.span.c >= 4">{{ member.label }}</span></button>
    </div>
    <div v-else-if="device.type === 'slider_light' && device.span.r >= 2" class="bottom-bar">
      <div class="secondary-grid" :class="{ single: device.secondaryButtons?.length === 1, sliders: device.span.c >= 4 }">
        <template v-for="button in device.secondaryButtons" :key="button.id">
          <label v-if="device.span.c >= 4 && button.type !== 'ghost_momentary'" class="secondary-slider" :class="{ active: button.active }">
            <span class="secondary-slider-fill" :style="{ width: `${button.active ? button.brightness : 0}%` }" />
            <AppIcon :name="button.icon" :size="16" /><span>{{ button.label }}</span><b>{{ button.brightness }}%</b>
            <input type="range" min="1" max="100" :value="button.brightness" :aria-label="button.label" @input="button.brightness = Number(($event.target as HTMLInputElement).value); button.active = true">
          </label>
          <button v-else class="pill secondary-pill" :class="[{ active: button.active || flashing === button.id, ghost: button.type === 'ghost_momentary' }]" @pointerdown.stop @click.stop="secondaryAction(button)">
            <AppIcon v-if="button.type !== 'ghost_momentary'" :name="button.icon" :size="16" /><span>{{ button.label }}</span><AppIcon v-if="button.type === 'ghost_momentary'" :name="button.icon" :size="16" />
          </button>
        </template>
      </div>
      <label v-if="device.span.r >= 3 && device.colorTemp" class="embedded-range"><span>Barwa</span><input type="range" min="2200" max="6000" :value="device.colorTemp" @input="update(device.id, { colorTemp: Number(($event.target as HTMLInputElement).value) })"><b>{{ device.colorTemp }} K</b></label>
    </div>
    <div v-else-if="device.type === 'matter_context_tile' && device.span.r >= 2" class="bottom-bar context-details">
      <span>Dźwięk: {{ device.soundContext }}</span><span>{{ device.prediction }}</span>
    </div>
    <div v-else-if="device.type === 'simple_thermostat' && device.span.r >= 2" class="bottom-bar thermostat-details">
      <div v-if="device.matterSuggestion" class="suggestion"><span>Matter 1.6: {{ device.matterSuggestion.source }} ({{ device.matterSuggestion.suggestedTemp }}°C)</span><button @click.stop="update(device.id, { targetTemp: device.matterSuggestion.suggestedTemp })">Przyjmij</button></div>
      <div class="preset-grid"><button v-for="preset in [{ n: 'Eco', t: 19 }, { n: 'Komfort', t: 22 }, { n: 'Boost', t: 25 }]" :key="preset.n" class="pill" @click.stop="update(device.id, { targetTemp: preset.t, demand: preset.t > (device.measuredTemp || 0) ? 55 : 0 })">{{ preset.n }} {{ preset.t }}°C</button></div>
    </div>
    <div v-else-if="device.type === 'rich_ac_row' && device.span.r >= 2" class="bottom-bar"><label class="embedded-range"><span>Nawiew</span><input type="range" min="0" max="100" :value="device.fanSpeedPct" @input="update(device.id, { fanSpeedPct: Number(($event.target as HTMLInputElement).value) })"><b>{{ device.fanSpeedPct }}%</b></label></div>
    <div v-else-if="device.type === 'stateful_tv' && device.span.r >= 2" class="bottom-bar"><label class="embedded-range"><span>Amplituner</span><input type="range" min="0" max="100" :value="device.volume" @input="update(device.id, { volume: Number(($event.target as HTMLInputElement).value) })"><b>{{ device.volume }}%</b></label></div>
    <div v-else-if="device.type === 'stateful_dishwasher' && device.span.r >= 2" class="bottom-bar appliance-controls">
      <button class="pill programme" @click.stop="cycleProgramme">{{ device.programme }}<AppIcon name="ChevronDown" :size="13" /></button>
      <div><button v-for="modifier in [{ id: 'cleanPlus', label: device.id === 'ev_wallbox' ? 'Solar PV' : 'Clean+' }, { id: 'speedPlus', label: device.id === 'ev_wallbox' ? 'V2H 11kW' : 'Speed+' }, { id: 'dryPlus', label: device.id === 'ev_wallbox' ? 'Limit 80%' : 'Dry+' }]" :key="modifier.id" class="pill" :class="{ active: device[modifier.id] }" @click.stop="update(device.id, { [modifier.id]: !device[modifier.id] })">{{ modifier.label }}</button></div>
    </div>
    <div v-else-if="device.type === 'webrtc_camera_tile' && device.span.r >= 2" class="bottom-bar camera-details"><span>{{ device.detections }}</span><b v-if="!device.privacy" class="live"><i />LIVE</b></div>
    <div v-else-if="device.type === 'matter_event_history' && device.span.r >= 2" class="bottom-bar event-list"><div v-for="event in device.events" :key="event.time"><span>{{ event.label }}</span><time>{{ event.time }}</time></div></div>

    <div v-if="device.nestedTiles.length && !nested && device.span.r >= 2 && (device.span.c > device.defaultSpan.c || device.span.r > device.defaultSpan.r)" class="nested-drawer" @pointerdown.stop @click.stop>
      <header><AppIcon name="CornerDownRight" :size="13" />Zagnieżdżone kafelki ({{ device.nestedTiles.length }})</header>
      <DeviceTile v-for="childId in device.nestedTiles" :key="childId" :device="state.entities[childId]" nested @open="emit('open', $event)" />
    </div>
    <button v-if="!nested && device.expanders.down" class="expander down" :class="{ changed: device.span.r > device.defaultSpan.r }" aria-label="Rozwiń w dół" @pointerdown.stop @click.stop="expand(device.id, 'down')"><AppIcon name="ChevronDown" :size="15" /></button>
    <button v-if="!nested && device.expanders.right" class="expander right" :class="{ changed: device.span.c > device.defaultSpan.c }" aria-label="Rozwiń w bok" @pointerdown.stop @click.stop="expand(device.id, 'right')"><AppIcon name="ChevronRight" :size="15" /></button>
    <button v-if="!nested && device.expanders.diagonal" class="expander diagonal" :class="{ changed: device.span.c !== device.defaultSpan.c || device.span.r !== device.defaultSpan.r }" aria-label="Zmień rozmiar" @pointerdown.stop @click.stop="expand(device.id, 'diagonal')"><AppIcon :name="device.span.c !== device.defaultSpan.c || device.span.r !== device.defaultSpan.r ? 'ArrowUpLeft' : 'ArrowDownRight'" :size="14" /></button>
  </article>
</template>
