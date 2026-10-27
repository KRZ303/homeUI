import type { Entity, Span, WidgetType } from '../types'
import { clamp } from './format'

const SLIDER_TYPES: WidgetType[] = ['slider_light', 'vertical_blind', 'rich_ac_row', 'stateful_tv']

export function isSliderBasedEntity(ent: Entity | WidgetType): boolean {
  const type = typeof ent === 'string' ? ent : ent.type
  return SLIDER_TYPES.includes(type)
}

export function isSimpleEntity(ent: Entity): boolean {
  if ((ent.nestedTiles?.length ?? 0) > 0) return false
  if (ent.type === 'slider_light') return (ent.secondaryButtons?.length ?? 0) === 0
  return ['scene_pill', 'simple_thermostat', 'closure_lock_tile', 'matter_smoke_alarm', 'sensor_graph'].includes(ent.type)
}

export function effectiveSpan(ent: Entity): Span {
  let c = ent.span.c
  let r = ent.span.r
  if (isSliderBasedEntity(ent)) c = Math.max(2, c)
  if (ent.type === 'vertical_blind') r = Math.max(3, r)
  return { c: clamp(c, 1, 4), r: clamp(r, 1, 3) }
}

export function maxInlineForSpan(c: number): number {
  if (c >= 4) return 4
  if (c === 3) return 2
  if (c === 2) return 1
  return 0
}

export function trackFillWidth(pct: number, active: boolean): string {
  if (!active) return '0px'
  const p = clamp(pct, 0, 100)
  return `calc(52px + (100% - 52px) * ${p / 100})`
}

export function verticalFillHeight(position: number, active = true): string {
  if (!active) return '0px'
  const p = clamp(position, 0, 100)
  return `calc(52px + (100% - 52px) * ${p / 100})`
}

export function subtitleFor(ent: Entity): string {
  switch (ent.type) {
    case 'slider_light': {
      if (!ent.on) return 'wyłączono'
      const base = ent.customSubtitle
        ? `${ent.brightness ?? 0}% • ${ent.customSubtitle}`
        : ent.powerWatts
          ? `${ent.brightness ?? 0}% • ${ent.powerWatts}`
          : `${ent.brightness ?? 0}%`
      return base
    }
    case 'group_tile': {
      const active = ent.members?.filter((m) => m.active).length ?? 0
      return `${active}/${ent.members?.length ?? 0} • ${ent.soilMoisture ?? 'Aktywne'}`
    }
    case 'scene_pill':
      return ent.active ? 'aktywna' : 'scena'
    case 'vertical_blind':
      return `${ent.position ?? 0}% • Lamele ${ent.tilt ?? 0}°`
    case 'matter_context_tile':
      return ent.active ? (ent.activity ?? '') : 'Czujnik prywatności wyciszony'
    case 'hvac_global_modes': {
      if (!ent.modes) return 'Wyłączone'
      if (ent.modes.heat && ent.modes.auto) return 'Grzanie + Auto'
      if (ent.modes.cool) return 'Chłodzenie'
      if (ent.modes.heat) return 'Grzanie'
      if (ent.modes.auto) return 'Auto'
      return 'Wyłączone'
    }
    case 'simple_thermostat':
      return `${(ent.targetTemp ?? 0).toFixed(1).replace('.', ',')} °C • ${ent.demand ?? 0}%`
    case 'rich_ac_row':
      return `${(ent.measuredTemp ?? 0).toFixed(1).replace('.', ',')} °C → Cel ${(ent.targetTemp ?? 0).toFixed(1).replace('.', ',')} °C`
    case 'stateful_tv':
      return ent.on ? `${ent.source ?? ''} • Głośność ${ent.volume ?? 0}%` : 'wyłączono'
    case 'stateful_dishwasher': {
      const idle = ent.state === 'idle'
      if (idle) return 'zamknięto • gotowe'
      return `${ent.state === 'paused' ? 'Wstrzymano' : 'W trakcie'} • ${ent.remainingMinutes ?? 0} min (${ent.progress ?? 0}%)`
    }
    case 'robot_vacuum_tile':
      return ent.on
        ? `${ent.mode ?? 'Sprzątanie'} • Bateria ${ent.battery ?? 0}%`
        : `W stacji dokującej • ${ent.battery ?? 0}%`
    case 'webrtc_camera_tile':
      return ent.privacy ? 'WebRTC wył.' : (ent.ptzPreset ?? '')
    case 'closure_lock_tile':
      return `${ent.locked ? 'Zamknięte' : 'Otwarte'} • ${ent.lastActor ?? ''}`
    case 'matter_smoke_alarm':
      return ent.mounted
        ? `Zamontowany w uchwycie • CO ${ent.coPpm ?? 0} ppm`
        : 'UWAGA: Zdjęto z uchwytu sufitowego!'
    case 'matter_event_history':
      return ent.events?.[0] ? `${ent.events[0].time} — ${ent.events[0].label}` : ''
    case 'matter_fabric_hub':
      return `Thread 1.4 (${ent.threadNodes ?? 0} węzłów) • Wspólny Datastore`
    case 'sensor_graph': {
      const primary = ent.series?.[0]
      const graphVisible = effectiveSpan(ent).c >= 2 && effectiveSpan(ent).r >= 2
      if (!primary) return ''
      if (graphVisible) return 'Ostatnie 24h'
      const secondary = ent.series?.[1]
      const secondPart = secondary && effectiveSpan(ent).c >= 2 ? ` • ${secondary.current} ${secondary.unit}` : ''
      return `${primary.current} ${primary.unit}${secondPart}`
    }
    default:
      return ''
  }
}

export function surfaceClassFor(ent: Entity): string {
  switch (ent.type) {
    case 'sensor_graph':
      return 'bg-[#2E3440]'
    case 'group_tile':
      return ent.members?.some((m) => m.active) ? 'bg-[#31537A]' : 'bg-[#303030]'
    case 'matter_context_tile':
      return ent.active ? 'bg-[#2B3F46]' : 'bg-[#303030]'
    case 'webrtc_camera_tile':
      return 'bg-[#26292E]'
    case 'matter_fabric_hub':
      return 'bg-[#2B3B4E]'
    default:
      return 'bg-[#303030]'
  }
}
