import type { Entity, Span, WidgetType } from '../types'
import { clamp, decimalComma } from './format'

const SLIDER_TYPES: WidgetType[] = ['slider_light', 'vertical_blind', 'rich_ac_row', 'stateful_tv']

export interface TrackModel {
  mode: 'none' | 'slider' | 'progress'
  active: boolean
  pct: number
  colorClass: string
}

export function isSliderBasedEntity(ent: Entity | WidgetType): boolean {
  const type = typeof ent === 'string' ? ent : ent.type
  return SLIDER_TYPES.includes(type)
}

export function isSimpleEntity(ent: Entity): boolean {
  if ((ent.nestedTiles?.length ?? 0) > 0) return false
  if (ent.type === 'slider_light') return (ent.secondaryButtons?.length ?? 0) === 0
  return ['scene_pill', 'simple_thermostat', 'closure_lock_tile', 'matter_smoke_alarm', 'sensor_graph'].includes(
    ent.type,
  )
}

/** Enforced footprint: sliders C≥2, vertical blind R≥3, clamped to the 4×3 virtual grid. */
export function effectiveSpan(ent: Entity): Span {
  let c = ent.span.c
  let r = ent.span.r
  if (isSliderBasedEntity(ent)) c = Math.max(2, c)
  if (ent.type === 'vertical_blind') r = Math.max(3, r)
  return { c: clamp(c, 1, 4), r: clamp(r, 1, 3) }
}

/** Inline capacity of Main Buttons in the Top Row as a function of column span C. */
export function maxInlineForSpan(c: number): number {
  if (c >= 4) return 4
  if (c === 3) return 2
  if (c === 2) return 1
  return 0
}

/** Oversized top-row capsule fill: 52px icon halo + linear interpolation to 100% width. */
export function trackFillWidth(pct: number, active: boolean): string {
  if (!active) return '0px'
  const p = clamp(pct, 0, 100)
  return `calc(52px + (100% - 52px) * ${p / 100})`
}

/** Oversized left-column vertical capsule fill: 52px halo + linear interpolation to 100% height. */
export function verticalFillHeight(position: number, active = true): string {
  if (!active) return '0px'
  const p = clamp(position, 0, 100)
  return `calc(52px + (100% - 52px) * ${p / 100})`
}

export function minHeightForRows(r: number): string {
  if (r >= 3) return '216px'
  if (r === 2) return '140px'
  return '68px'
}

export function trackModelFor(ent: Entity): TrackModel {
  switch (ent.type) {
    case 'slider_light':
      return {
        mode: 'slider',
        active: Boolean(ent.on),
        pct: ent.brightness ?? 0,
        colorClass: 'bg-gradient-to-r from-amber-500/45 to-amber-400/35',
      }
    case 'group_tile': {
      const members = ent.members ?? []
      const active = members.filter((m) => m.active).length
      return {
        mode: 'progress',
        active: active > 0,
        pct: members.length ? (active / members.length) * 100 : 0,
        colorClass: 'bg-[#73B7B2]/30',
      }
    }
    case 'scene_pill':
      return { mode: 'progress', active: false, pct: 100, colorClass: 'bg-[#73B7B2]/35' }
    case 'simple_thermostat':
      return {
        mode: 'progress',
        active: (ent.demand ?? 0) > 0,
        pct: ent.demand ?? 0,
        colorClass: 'bg-[#9E5231]/75',
      }
    case 'rich_ac_row':
      return {
        mode: 'slider',
        active: Boolean(ent.on),
        pct: ent.fanSpeedPct ?? 0,
        colorClass: 'bg-gradient-to-r from-[#2D6880]/65 to-[#73B7B2]/45',
      }
    case 'stateful_tv':
      return {
        mode: 'slider',
        active: Boolean(ent.on),
        pct: ent.volume ?? 0,
        colorClass: 'bg-gradient-to-r from-indigo-500/45 to-[#73B7B2]/45',
      }
    case 'stateful_dishwasher': {
      const idle = ent.state !== 'running' && ent.state !== 'paused'
      return {
        mode: 'progress',
        active: !idle,
        pct: ent.progress ?? 0,
        colorClass: 'bg-[#3B6E6C]/70',
      }
    }
    case 'robot_vacuum_tile':
      return {
        mode: 'progress',
        active: true,
        pct: ent.progress ?? 0,
        colorClass: 'bg-[#3B6E6C]/65',
      }
    case 'closure_lock_tile':
      return {
        mode: 'progress',
        active: !ent.locked && (ent.position ?? 0) > 0,
        pct: ent.position ?? 0,
        colorClass: 'bg-[#3E5448]/85',
      }
    case 'matter_smoke_alarm':
      return { mode: 'progress', active: !ent.mounted, pct: 100, colorClass: 'bg-rose-600/55' }
    default:
      return { mode: 'none', active: false, pct: 0, colorClass: '' }
  }
}

export function subtitleFor(ent: Entity): string {
  switch (ent.type) {
    case 'slider_light': {
      if (!ent.on) return 'wyłączono'
      if (ent.customSubtitle) return `${ent.brightness ?? 0}% • ${ent.customSubtitle}`
      if (ent.powerWatts) return `${ent.brightness ?? 0}% • ${ent.powerWatts}`
      return `${ent.brightness ?? 0}%`
    }
    case 'group_tile': {
      const members = ent.members ?? []
      const active = members.filter((m) => m.active).length
      return `${active}/${members.length} • ${ent.soilMoisture ?? 'Aktywne'}`
    }
    case 'scene_pill':
      return ent.active ? 'aktywna' : 'scena'
    case 'vertical_blind':
      return `${ent.position ?? 0}% • Lamele ${ent.tilt ?? 0}°`
    case 'sensor_graph': {
      const primary = ent.series?.[0]
      if (!primary) return ''
      const graphVisible = effectiveSpan(ent).c >= 2 && effectiveSpan(ent).r >= 2
      if (graphVisible) return 'Ostatnie 24h'
      const secondary = ent.series?.[1]
      const second =
        secondary && effectiveSpan(ent).c >= 2 ? ` • ${secondary.current} ${secondary.unit}` : ''
      return `${primary.current} ${primary.unit}${second}`
    }
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
      return `${decimalComma(ent.targetTemp ?? 0)} °C • ${ent.demand ?? 0}%`
    case 'rich_ac_row':
      return `${decimalComma(ent.measuredTemp ?? 0)} °C → Cel ${decimalComma(ent.targetTemp ?? 0)} °C`
    case 'stateful_tv':
      return ent.on ? `${ent.source ?? ''} • Głośność ${ent.volume ?? 0}%` : 'wyłączono'
    case 'stateful_dishwasher': {
      if (ent.state === 'idle' || !ent.state) return 'zamknięto • gotowe'
      return `${ent.state === 'paused' ? 'Wstrzymano' : 'W trakcie'} • ${ent.remainingMinutes ?? 0} min (${
        ent.progress ?? 0
      }%)`
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
    default:
      return ''
  }
}

export function surfaceClassFor(ent: Entity): string {
  switch (ent.type) {
    case 'sensor_graph':
      return 'bg-[#2E3440]'
    case 'group_tile':
      return (ent.members ?? []).some((m) => m.active) ? 'bg-[#31537A]' : 'bg-[#303030]'
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

export function iconClassFor(ent: Entity): string {
  switch (ent.type) {
    case 'slider_light':
      return ent.on
        ? 'bg-amber-400/35 text-amber-200'
        : 'bg-white/[0.09] text-white/70 hover:bg-white/[0.15]'
    case 'group_tile':
      return (ent.members ?? []).some((m) => m.active)
        ? 'bg-[#2C3745] text-[#73B7B2]'
        : 'bg-white/[0.08] text-white/60'
    case 'scene_pill':
      return ent.active
        ? 'bg-[#73B7B2] text-[#182C2A]'
        : 'bg-white/[0.08] text-white/75 hover:bg-white/[0.15]'
    case 'vertical_blind':
      return (ent.position ?? 0) > 0
        ? 'bg-[#73B7B2] text-[#182C2A]'
        : 'bg-white/[0.1] text-white/75'
    case 'sensor_graph':
      return 'bg-[#3B4454] text-[#60A5FA]'
    case 'matter_context_tile':
      return ent.active ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.09] text-white/60'
    case 'hvac_global_modes': {
      const any = ent.modes ? ent.modes.cool || ent.modes.auto || ent.modes.heat : false
      return any ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.08] text-white/60'
    }
    case 'simple_thermostat':
      return (ent.demand ?? 0) > 0
        ? 'bg-amber-500/35 text-amber-200'
        : 'bg-white/[0.08] text-white/65'
    case 'rich_ac_row':
      return ent.on ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.09] text-white/70'
    case 'stateful_tv':
      return ent.on ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.09] text-white/65'
    case 'stateful_dishwasher': {
      const busy = ent.state === 'running' || ent.state === 'paused'
      return busy ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.09] text-white/70'
    }
    case 'robot_vacuum_tile':
      return ent.on ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.09] text-white/70'
    case 'webrtc_camera_tile':
      return ent.privacy ? 'bg-rose-500/30 text-rose-200' : 'bg-[#73B7B2] text-[#182C2A]'
    case 'closure_lock_tile':
      return ent.locked ? 'bg-white/[0.09] text-white/75' : 'bg-[#73B7B2] text-[#182C2A]'
    case 'matter_smoke_alarm':
      return ent.mounted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-400 text-black'
    case 'matter_event_history':
      return ent.armed ? 'bg-[#73B7B2] text-[#182C2A]' : 'bg-white/[0.09] text-white/70'
    case 'matter_fabric_hub':
      return 'bg-[#73B7B2] text-[#182C2A]'
    default:
      return 'bg-white/[0.09] text-white/70'
  }
}

export function defaultIconName(ent: Entity): string {
  switch (ent.type) {
    case 'slider_light':
      return ent.icon ?? 'Sofa'
    case 'group_tile':
      return ent.icon ?? 'Sprout'
    case 'scene_pill':
      return ent.icon ?? 'Moon'
    case 'vertical_blind':
      return ent.icon ?? 'window-shutter'
    case 'sensor_graph':
      return ent.icon ?? 'Thermometer'
    case 'matter_context_tile':
      return ent.active ? 'Eye' : 'EyeOff'
    case 'hvac_global_modes':
      return 'plug-off'
    case 'simple_thermostat':
      return ent.icon ?? 'Thermometer'
    case 'rich_ac_row':
      return 'Snowflake'
    case 'stateful_tv':
      return 'Tv'
    case 'stateful_dishwasher':
      return ent.iconName ?? 'door-closed'
    case 'robot_vacuum_tile':
      return 'robot-vacuum'
    case 'webrtc_camera_tile':
      return ent.privacy ? 'EyeOff' : 'Camera'
    case 'closure_lock_tile':
      return ent.locked ? 'Lock' : 'Unlock'
    case 'matter_smoke_alarm':
      return 'TriangleAlert'
    case 'matter_event_history':
      return 'History'
    case 'matter_fabric_hub':
      return 'Radio'
    default:
      return 'Circle'
  }
}
