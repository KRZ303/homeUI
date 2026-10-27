import { computed, reactive } from 'vue'
import rawEntities from '../data/entities.json'
import { INITIAL_LANES } from '../data/lanes'
import type {
  Entity,
  ExpandDirection,
  ExpanderKey,
  ExpandedContent,
  Lane,
  MainButton,
  Orientation,
  PortraitTitlePos,
  SecondaryButton,
  Span,
} from '../types'
import { clamp } from '../utils/format'
import { effectiveSpan, isSimpleEntity, isSliderBasedEntity } from '../utils/tile'

interface Toast {
  id: number
  text: string
}

interface PendingMerge {
  sourceId: string
  targetId: string
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const INITIAL_ENTITIES = clone(rawEntities) as unknown as Record<string, Entity>
const LANES = clone(INITIAL_LANES) as Lane[]

export const home = reactive({
  entities: clone(INITIAL_ENTITIES) as Record<string, Entity>,
  lanes: clone(LANES) as Lane[],
  activeLaneIdx: 0,
  orientation: 'portrait' as Orientation,
  portraitTitlePos: 'top' as PortraitTitlePos,
  modalEntityId: null as string | null,
  pendingMerge: null as PendingMerge | null,
  toasts: [] as Toast[],
  tileDragActive: false,
})

let toastSeq = 0

export const activeLane = computed<Lane>(() => home.lanes[home.activeLaneIdx] ?? home.lanes[0])
export const modalEntity = computed<Entity | null>(() =>
  home.modalEntityId ? (home.entities[home.modalEntityId] ?? null) : null,
)

export function showToast(text: string): void {
  const id = ++toastSeq
  home.toasts.push({ id, text })
  window.setTimeout(() => {
    const index = home.toasts.findIndex((toast) => toast.id === id)
    if (index >= 0) home.toasts.splice(index, 1)
  }, 3600)
}

export function setActiveLane(index: number): void {
  home.activeLaneIdx = clamp(index, 0, home.lanes.length - 1)
}

export function openModal(id: string): void {
  home.modalEntityId = id
}

export function closeModal(): void {
  home.modalEntityId = null
}

export function reset(): void {
  home.entities = clone(INITIAL_ENTITIES) as Record<string, Entity>
  home.lanes = clone(LANES) as Lane[]
  home.activeLaneIdx = 0
  home.modalEntityId = null
  home.pendingMerge = null
  showToast('Zresetowano prototyp do stanu początkowego')
}

function laneFor(ent: Entity): Lane | undefined {
  return home.lanes.find((lane) => lane.id === ent.column)
}

function removeFromLane(ent: Entity): void {
  const lane = laneFor(ent)
  if (lane) lane.entityIds = lane.entityIds.filter((id) => id !== ent.id)
}

export function setSpan(ent: Entity, span: Span): void {
  const minC = isSliderBasedEntity(ent) ? 2 : 1
  const minR = ent.type === 'vertical_blind' ? 3 : 1
  ent.span.c = clamp(span.c, minC, 4)
  ent.span.r = clamp(span.r, minR, 3)
}

export function toggleExpander(ent: Entity, key: ExpanderKey): void {
  ent.expanders[key] = !ent.expanders[key]
}

export function toggleExpandedContent(ent: Entity, key: keyof ExpandedContent): void {
  ent.expandedContent[key] = !ent.expandedContent[key]
}

export function cycleSpan(ent: Entity, direction: ExpandDirection): void {
  const current = effectiveSpan(ent)

  if (direction === 'down') {
    const minR = ent.type === 'vertical_blind' ? 3 : 1
    let nextR = current.r < 3 ? current.r + 1 : ent.defaultSpan.r
    nextR = Math.max(minR, nextR)
    if (nextR === current.r) nextR = Math.min(3, current.r + 1)
    ent.span.r = nextR
    const minC = isSliderBasedEntity(ent) ? 2 : 1
    if (ent.span.c < minC) ent.span.c = minC
    return
  }

  if (direction === 'right') {
    const minC = isSliderBasedEntity(ent) ? 2 : 1
    let nextC = current.c < 4 ? current.c + 1 : ent.defaultSpan.c
    nextC = Math.max(minC, nextC)
    if (nextC === current.c) nextC = Math.min(4, current.c + 1)
    ent.span.c = nextC
    if (ent.type === 'vertical_blind') ent.span.r = Math.max(3, ent.span.r)
    return
  }

  if (ent.type === 'sensor_graph') {
    if (current.c >= 3 && current.r >= 3) {
      ent.span.c = ent.defaultSpan.c
      ent.span.r = ent.defaultSpan.r
    } else if (current.c >= 2 && current.r >= 2) {
      ent.span.c = 3
      ent.span.r = 3
    } else {
      ent.span.c = 2
      ent.span.r = 2
    }
    return
  }

  const atDefault = current.c === ent.defaultSpan.c && current.r === ent.defaultSpan.r
  if (atDefault) {
    const minC = isSliderBasedEntity(ent) ? 2 : 1
    ent.span.c = clamp(current.c + 1, minC, 4)
    ent.span.r = clamp(current.r + 1, 1, 3)
  } else {
    ent.span.c = ent.defaultSpan.c
    ent.span.r = ent.defaultSpan.r
  }
}

/** Immediate primary action on the 44px circular icon (three-way interaction split). */
export function toggleIcon(ent: Entity): void {
  switch (ent.type) {
    case 'slider_light':
    case 'rich_ac_row':
    case 'stateful_tv':
    case 'robot_vacuum_tile':
      ent.on = !ent.on
      break
    case 'group_tile': {
      const members = ent.members ?? []
      const anyActive = members.some((member) => member.active)
      members.forEach((member) => {
        member.active = !anyActive
      })
      break
    }
    case 'scene_pill':
      ent.active = !ent.active
      break
    case 'vertical_blind':
      ent.position = (ent.position ?? 0) > 0 ? 0 : 100
      break
    case 'sensor_graph':
      cycleSpan(ent, 'diagonal')
      break
    case 'hvac_global_modes': {
      if (!ent.modes) return
      const anyActive = ent.modes.cool || ent.modes.auto || ent.modes.heat
      ent.modes.cool = !anyActive
      ent.modes.auto = !anyActive
      ent.modes.heat = !anyActive
      break
    }
    case 'simple_thermostat': {
      const heating = (ent.demand ?? 0) > 0
      ent.targetTemp = heating ? 19 : 24
      ent.demand = heating ? 0 : 55
      break
    }
    case 'stateful_dishwasher':
      if (ent.state === 'idle' || !ent.state) {
        ent.state = 'running'
        ent.progress = 24
        ent.remainingMinutes = 82
      } else if (ent.state === 'running') {
        ent.state = 'paused'
      } else {
        ent.state = 'running'
      }
      break
    case 'matter_context_tile':
      ent.active = !ent.active
      break
    case 'webrtc_camera_tile':
      ent.privacy = !ent.privacy
      break
    case 'closure_lock_tile':
      ent.locked = !ent.locked
      break
    case 'matter_smoke_alarm':
      ent.mounted = !ent.mounted
      if (!ent.mounted) showToast('Alert Matter 1.6: Czujnik zdjęto z uchwytu sufitowego!')
      break
    case 'matter_event_history':
      ent.armed = !ent.armed
      break
    case 'matter_fabric_hub':
      ent.threadNodes = (ent.threadNodes ?? 0) + 1
      showToast('Zbliżono telefon NFC: Sparowano nowe urządzenie Matter 1.6 bez zasilania!')
      break
    default:
      break
  }
}

/** Generic Main Button toggle for archetypes without dedicated handlers. */
export function toggleMainButton(ent: Entity, buttonId: string): void {
  const target = ent.mainButtons?.find((candidate) => candidate.id === buttonId)
  if (target) target.active = !target.active
}

export function toggleSecondaryButton(ent: Entity, buttonId: string): void {
  const target = ent.secondaryButtons?.find((candidate) => candidate.id === buttonId)
  if (target) target.active = !target.active
}

export function toggleMember(ent: Entity, memberId: string): void {
  const member = ent.members?.find((candidate) => candidate.id === memberId)
  if (member) member.active = !member.active
}

export function setBrightness(ent: Entity, pct: number): void {
  ent.brightness = Math.round(clamp(pct, 1, 100))
  ent.on = true
}

export function setSecondaryBrightness(ent: Entity, buttonId: string, pct: number): void {
  const target = ent.secondaryButtons?.find((candidate) => candidate.id === buttonId)
  if (!target) return
  target.brightness = Math.round(clamp(pct, 1, 100))
  target.active = target.brightness > 1
}

export function setBlind(ent: Entity, pct: number): void {
  ent.position = Math.round(clamp(pct, 0, 100))
}

export function setTilt(ent: Entity, deg: number): void {
  ent.tilt = Math.round(clamp(deg, 0, 90))
}

export function setFanSpeed(ent: Entity, pct: number): void {
  ent.fanSpeedPct = Math.round(clamp(pct, 0, 100))
  ent.on = true
}

export function setVolume(ent: Entity, pct: number): void {
  ent.volume = Math.round(clamp(pct, 0, 100))
  ent.on = true
}

export function setColorTemp(ent: Entity, kelvin: number): void {
  ent.colorTemp = Math.round(clamp(kelvin, 2200, 6000))
}

export function setHvacMode(ent: Entity, mode: 'cool' | 'auto' | 'heat'): void {
  ent.modes = { cool: false, auto: false, heat: false }
  if (mode === 'cool') ent.modes.cool = true
  if (mode === 'auto') ent.modes.auto = true
  if (mode === 'heat') {
    ent.modes.auto = true
    ent.modes.heat = true
  }
}

export function thermostatStep(ent: Entity, delta: number): void {
  ent.targetTemp = Math.round(clamp((ent.targetTemp ?? 20) + delta, 15, 30) * 10) / 10
}

export function thermostatPreset(ent: Entity, preset: string, temp: number): void {
  ent.preset = preset
  ent.targetTemp = temp
}

export function acceptSuggestion(ent: Entity): void {
  if (!ent.matterSuggestion?.active) return
  ent.targetTemp = ent.matterSuggestion.suggestedTemp
  ent.matterSuggestion.status = 'Zaakceptowano przez termostat'
  ent.matterSuggestion.active = false
  showToast(`Matter 1.6: Przyjęto sugestię ${ent.matterSuggestion.suggestedTemp.toFixed(1).replace('.', ',')}°C`)
}

export function acToggle(ent: Entity, key: 'swing' | 'fan' | 'ionizer'): void {
  ent[key] = !ent[key]
}

export function acStepTarget(ent: Entity): void {
  const next = (ent.targetTemp ?? 22) >= 24 ? 18 : Math.round(((ent.targetTemp ?? 22) + 0.5) * 10) / 10
  ent.targetTemp = next
}

const TV_SOURCES = ['Netflix • 4K', 'PS5', 'Matter Cast']

export function tvAction(ent: Entity, id: string): void {
  if (id === 'source') {
    const current = TV_SOURCES.indexOf(ent.source ?? '')
    ent.source = TV_SOURCES[(current + 1) % TV_SOURCES.length]
    showToast(`Źródło: ${ent.source}`)
  } else if (id === 'play') {
    ent.playing = !ent.playing
  } else if (id === 'power') {
    ent.on = !ent.on
  }
}

export function vacuumZone(ent: Entity, zone: string): void {
  ent.mode = zone
  ent.on = true
  showToast(`Robot: sprzątanie strefy „${zone}”`)
}

const DELAY_OPTIONS = ['0:00', '1:00', '2:00', '4:00']

const PROGRAMME_OPTIONS = [
  'Intensywny 70°C',
  'Auto 45-65°C',
  'Eco 50°C',
  'Szybki 45°C',
]

export function dishwasherAction(ent: Entity, id: string): void {
  if (id === 'delay') {
    const current = DELAY_OPTIONS.indexOf(ent.delay ?? '0:00')
    ent.delay = DELAY_OPTIONS[(current + 1) % DELAY_OPTIONS.length]
    return
  }
  if (id === 'start') {
    ent.state = 'running'
    ent.progress = 24
    ent.remainingMinutes = 82
    return
  }
  if (id === 'pause') {
    ent.state = ent.state === 'paused' ? 'running' : 'paused'
    return
  }
  if (id === 'stop') {
    ent.state = 'idle'
    ent.progress = 0
    ent.remainingMinutes = 0
  }
}

export function cycleProgramme(ent: Entity): void {
  const current = PROGRAMME_OPTIONS.indexOf(ent.programme ?? '')
  ent.programme = PROGRAMME_OPTIONS[(current + 1) % PROGRAMME_OPTIONS.length]
}

export function toggleModifier(ent: Entity, key: 'cleanPlus' | 'speedPlus' | 'dryPlus'): void {
  ent[key] = !ent[key]
}

export function fabricSync(ent: Entity, ecosystem: string): void {
  showToast(`Matter 1.6 Joint Fabric: Zsynchronizowano klucz datastore — ${ecosystem}`)
}

/** Live 2200ms appliance cycle timer. */
export function tickAppliances(): void {
  for (const ent of Object.values(home.entities)) {
    if (ent.type !== 'stateful_dishwasher' || ent.state !== 'running') continue
    ent.progress = Math.min(100, (ent.progress ?? 0) + 2)
    if ((ent.remainingMinutes ?? 0) > 0) ent.remainingMinutes = (ent.remainingMinutes ?? 0) - 1
    if ((ent.progress ?? 0) >= 100) {
      ent.state = 'idle'
      ent.progress = 0
      ent.remainingMinutes = 0
      showToast(`${ent.title}: cykl zakończony`)
    }
  }
}

/** Tile composition engine — Rules A, B & C (§5.3). */
export function requestCompose(sourceId: string, targetId: string): void {
  if (sourceId === targetId) return
  const source = home.entities[sourceId]
  const target = home.entities[targetId]
  if (!source || !target) return

  if (source.type === 'sensor_graph' && target.type === 'sensor_graph') {
    executeRuleC(source, target)
    return
  }

  if (isSimpleEntity(source) && (isSimpleEntity(target) || target.type === 'slider_light')) {
    home.modalEntityId = null
    home.pendingMerge = { sourceId, targetId }
    return
  }

  executeRuleB(source, target)
}

/** Rule A — Group & control together (width-preserving owner-approved rule). */
export function executeRuleAGroupTogether(): void {
  const pending = home.pendingMerge
  if (!pending) return
  const source = home.entities[pending.sourceId]
  const target = home.entities[pending.targetId]
  home.pendingMerge = null
  if (!source || !target) return

  const sourceTitle = source.title
  const targetTitle = target.title
  target.title = `${target.title} + ${source.title}`
  target.span.c = Math.max(2, target.span.c)
  target.span.r = target.span.r
  target.on = Boolean(target.on || source.on)
  target.brightness = Math.round(((target.brightness ?? 50) + (source.brightness ?? 50)) / 2)
  removeFromLane(source)
  showToast(`Zgrupowano „${sourceTitle}” i „${targetTitle}” — sterowanie razem`)
}

/** Rule A — Add as a Secondary Button in Row 2+. */
export function executeRuleAAddAsSecondaryButton(): void {
  const pending = home.pendingMerge
  if (!pending) return
  const source = home.entities[pending.sourceId]
  const target = home.entities[pending.targetId]
  home.pendingMerge = null
  if (!source || !target) return

  const button: SecondaryButton = {
    id: `sec_${source.id}`,
    label: source.title,
    icon: source.iconType === 'mdi' && source.icon ? source.icon : 'table-lamp',
    iconType: 'mdi',
    active: Boolean(source.on || source.active),
    brightness: source.brightness ?? 60,
    type: 'oval_pill',
  }
  target.secondaryButtons = [...(target.secondaryButtons ?? []), button]
  target.span.c = Math.max(2, target.span.c)
  target.span.r = Math.max(2, target.span.r)
  target.expanders.down = true
  target.expanders.right = true
  target.expandedContent.secondaryButtons = true
  removeFromLane(source)
  showToast(`Dodano „${source.title}” jako przycisk dodatkowy na „${target.title}”`)
}

/** Rule B — Complex entity nested inside the host's expandable drawer. */
export function executeRuleB(source: Entity, target: Entity): void {
  target.nestedTiles = [...(target.nestedTiles ?? []), source.id]
  target.expanders.down = true
  target.expanders.right = true
  removeFromLane(source)
  showToast(`Zagnieżdżono „${source.title}” w „${target.title}”`)
}

/** Rule C — Sensor graph merge onto a single 3×3 multi-sensor chart. */
export function executeRuleC(source: Entity, target: Entity): void {
  const seen = new Set(target.series?.map((s) => s.id) ?? [])
  const merged = [...(target.series ?? [])]
  for (const series of source.series ?? []) {
    if (!seen.has(series.id)) {
      merged.push(series)
      seen.add(series.id)
    }
  }
  target.series = merged
  target.title = `${target.title.replace(' 24h', '')} + ${source.title.replace(' 24h', '')}`
  target.span.c = Math.max(3, target.span.c)
  target.span.r = Math.max(3, target.span.r)
  target.steppedAreaPoints = source.steppedAreaPoints ?? target.steppedAreaPoints
  removeFromLane(source)
  showToast(`Połączono wykresy 24h: „${target.title}”`)
}

export function unnestTile(host: Entity, childId: string): void {
  host.nestedTiles = (host.nestedTiles ?? []).filter((id) => id !== childId)
  const lane = laneFor(host)
  if (lane) lane.entityIds = [...lane.entityIds, childId]
  showToast('Wypięto kafelek z powrotem na siatkę')
}

/** Main Button dispatch hub — tiles call this with their resolved button id. */
export function handleMainButton(ent: Entity, button: MainButton, buttonId: string): void {
  switch (ent.type) {
    case 'stateful_dishwasher':
      dishwasherAction(ent, buttonId)
      break
    case 'stateful_tv':
      tvAction(ent, buttonId)
      break
    case 'rich_ac_row':
      if (buttonId === 'temp') acStepTarget(ent)
      else acToggle(ent, buttonId as 'swing' | 'fan' | 'ionizer')
      break
    case 'simple_thermostat':
      if (buttonId === 'minus') thermostatStep(ent, -0.5)
      else if (buttonId === 'plus') thermostatStep(ent, 0.5)
      else if (buttonId === 'suggestion' && ent.matterSuggestion?.active) {
        ent.targetTemp = ent.matterSuggestion.suggestedTemp
        ent.matterSuggestion.active = false
        ent.matterSuggestion.status = 'Zaakceptowano przez termostat'
      }
      break
    case 'hvac_global_modes':
      setHvacMode(ent, buttonId as 'cool' | 'auto' | 'heat')
      break
    case 'matter_fabric_hub':
      fabricSync(ent, button.label)
      break
    case 'robot_vacuum_tile':
      vacuumZone(ent, button.label)
      break
    case 'webrtc_camera_tile':
      if (buttonId === 'privacy') ent.privacy = !ent.privacy
      else showToast(`Kamera: ustawiono preset PTZ — ${ent.ptzPreset ?? ''}`)
      break
    case 'vertical_blind':
      if (buttonId === 'tilt_45') ent.tilt = 45
      else if (buttonId === 'privacy_0') ent.tilt = 0
      toggleMainButton(ent, buttonId)
      break
    default:
      toggleMainButton(ent, buttonId)
      break
  }
}
