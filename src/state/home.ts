import { reactive, ref } from 'vue'
import { createInitialState } from '../data/home'
import type { Device, Span } from '../types'

const state = reactive(createInitialState())
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

function notify(message: string) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 3600)
}

function update(id: string, patch: Partial<Device>) {
  Object.assign(state.entities[id], patch)
}

function isSimple(device: Device) {
  return !device.nestedTiles.length && ['slider_light', 'scene_pill', 'simple_thermostat', 'closure_lock_tile', 'matter_smoke_alarm', 'sensor_graph'].includes(device.type)
}

function compose(sourceId: string, targetId: string, mode?: 'group' | 'secondary') {
  const source = state.entities[sourceId]
  const target = state.entities[targetId]
  if (!source || !target || sourceId === targetId) return 'done'
  if (source.type === 'sensor_graph' && target.type === 'sensor_graph') {
    const series = [...(target.series || [])]
    for (const item of source.series || []) if (!series.some((existing) => existing.id === item.id)) series.push(item)
    update(targetId, {
      title: `${target.title.replace(' 24h', '')} + ${source.title.replace(' 24h', '')}`,
      series, span: { c: Math.max(3, target.span.c), r: Math.max(3, target.span.r) },
    })
  } else if (isSimple(source) && isSimple(target)) {
    if (!mode) return 'choice'
    if (mode === 'group') {
      update(targetId, {
        title: `${target.title} + ${source.title}`,
        on: Boolean(target.on || source.on),
        brightness: Math.round(((target.brightness || 50) + (source.brightness || 50)) / 2),
        span: { c: Math.max(2, target.span.c), r: target.span.r },
      })
    } else {
      target.secondaryButtons ||= []
      target.secondaryButtons.push({
        id: `sec_${source.id}`, label: source.title, icon: source.icon || source.iconName || 'Lightbulb',
        active: Boolean(source.on || source.active), brightness: source.brightness ?? 60, type: 'oval_pill',
      })
      update(targetId, {
        span: { c: Math.max(2, target.span.c), r: Math.max(2, target.span.r) },
        expanders: { ...target.expanders, down: true, right: true },
      })
    }
  } else {
    update(targetId, {
      nestedTiles: [...target.nestedTiles, sourceId],
      expanders: { ...target.expanders, down: true, right: true },
    })
  }
  const lane = state.lanes.find((item) => item.id === source.column)
  if (lane) lane.entityIds = lane.entityIds.filter((id) => id !== sourceId)
  notify(`${source.title} połączono z ${target.title}`)
  return 'done'
}

function unnest(hostId: string, childId: string) {
  const host = state.entities[hostId]
  host.nestedTiles = host.nestedTiles.filter((id) => id !== childId)
  const lane = state.lanes.find((item) => item.id === host.column)
  if (lane && !lane.entityIds.includes(childId)) lane.entityIds.push(childId)
}

function iconAction(id: string) {
  const device = state.entities[id]
  switch (device.type) {
    case 'slider_light': case 'rich_ac_row': case 'stateful_tv': case 'robot_vacuum_tile':
      update(id, { on: !device.on }); break
    case 'group_tile': {
      const turnOn = !device.members?.some((member) => member.active)
      device.members?.forEach((member) => { member.active = turnOn }); break
    }
    case 'scene_pill': update(id, { active: !device.active }); break
    case 'vertical_blind': update(id, { position: device.position ? 0 : 100 }); break
    case 'sensor_graph': {
      const span: Span = device.span.c === 1 ? { c: 2, r: 2 } : device.span.c === 2 ? { c: 3, r: 3 } : { ...device.defaultSpan }
      update(id, { span }); break
    }
    case 'hvac_global_modes': {
      const enabled = !Object.values(device.modes || {}).some(Boolean)
      update(id, { modes: { cool: false, auto: enabled, heat: enabled } }); break
    }
    case 'simple_thermostat': {
      const active = !device.demand
      update(id, { targetTemp: active ? 24 : 19, demand: active ? 55 : 0 }); break
    }
    case 'stateful_dishwasher':
      update(id, { state: device.state === 'idle' ? 'running' : device.state === 'running' ? 'paused' : 'running' }); break
    case 'webrtc_camera_tile': update(id, { privacy: !device.privacy }); break
    case 'closure_lock_tile': update(id, { locked: !device.locked }); break
    case 'matter_smoke_alarm': update(id, { mounted: !device.mounted }); break
    case 'matter_event_history': update(id, { armed: !device.armed }); break
    case 'matter_fabric_hub':
      update(id, { threadNodes: (device.threadNodes || 0) + 1 })
      notify('Zbliżono telefon NFC: sparowano nowe urządzenie Matter 1.6 bez zasilania.')
      break
    case 'matter_context_tile': update(id, { active: !device.active }); break
  }
}

function expand(id: string, direction: 'down' | 'right' | 'diagonal') {
  const device = state.entities[id]
  const span = { ...device.span }
  const fallback = device.defaultSpan
  if (device.type === 'sensor_graph' && direction === 'diagonal') {
    iconAction(id); return
  }
  if (direction === 'down') {
    const min = device.type === 'vertical_blind' ? 3 : 1
    span.r = span.r < 3 ? span.r + 1 : fallback.r
    span.r = Math.max(min, span.r)
  } else if (direction === 'right') {
    const min = ['slider_light', 'rich_ac_row', 'stateful_tv', 'vertical_blind'].includes(device.type) ? 2 : 1
    span.c = span.c < 4 ? span.c + 1 : fallback.c
    span.c = Math.max(min, span.c)
  } else {
    const modified = span.c !== fallback.c || span.r !== fallback.r
    Object.assign(span, modified ? fallback : { c: Math.min(4, Math.max(2, span.c + 1)), r: Math.min(3, span.r + 1) })
  }
  update(id, { span })
}

function reset() {
  const fresh = createInitialState()
  state.entities = fresh.entities
  state.lanes = fresh.lanes
  notify('Przywrócono początkowy układ Elastic Home.')
}

export function useHome() {
  return { state, toast, notify, update, compose, unnest, iconAction, expand, reset, isSimple }
}
