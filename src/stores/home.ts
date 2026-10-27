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

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

export const home = reactive({
  entities: clone(rawEntities) as unknown as Record<string, Entity>,
  lanes: clone(INITIAL_LANES) as Lane[],
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

export function setSpan(ent: Entity, span: Span): void {
  const minC = isSliderBasedEntity(ent) ? 2 : 1
  const minR = ent.type === 'vertical_blind' ? 3 : 1
  ent.span.c = clamp(span.c, minC, 4)
  ent.span.r = clamp(span.r, minR, 3)
}

function laneFor(ent: Entity): Lane | undefined {
  return home.lanes.find((lane) => lane.id === ent.column)
}

function removeFromLane(ent: Entity): void {
  const lane = laneFor(ent)
  if (lane) lane.entityIds = lane.entityIds.filter((id) => id !== ent.id)
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
    if (ent.span.c < (isSliderBasedEntity(ent) ? 2 : 1)) ent.span.c = isSliderBasedEntity(ent) ? 2 : 1
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
    ent.span.c = clamp(current.c + 1, isSliderBasedEntity(ent) ? 2 : 1, 4)
    ent.span.r = clamp(current.r + 1, 1, 3)
  } else {
    ent.span.c = ent.defaultSpan.c
    ent.span.r = ent.defaultSpan.r
  }
}

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
      if (ent.state === 'idle') {
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

export function toggleMainButton(ent: Entity, button: MainButton): void {
  if (!ent.mainButtons) return
  const target = ent.mainButtons.find((candidate) => candidate.id === button.id)
  if (target) target.active = !target.active
}

export function toggleSecondaryButton(ent: Entity, button: SecondaryButton): void {
  if (!ent.secondaryButtons) return
  const target = ent.secondaryButtons.find((candidate) => candidate.id === button.id)
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

export function setBlind(ent: Entity, pct: number): void {
  ent.position = Math.round(clamp(pct, 0, 100))
}

export function setFanSpeed(ent: Entity, pct: number): void {
  ent.fanSpeedPct = Math.round(clamp(pct, 0, 100))
  ent.on = true
}

export function setVolume(ent: Entity, pct: number): void {
  ent.volume = Math.round(clamp(pct, 0, 100))
  ent.on = true
}

export function tickAppliances(): void {
  for (const ent of Object.values(home.entities)) {
    if (ent.type !== 'stateful_dishwasher' || ent.state !== 'running') continue
    if ((ent.progress ?? 0) < 100) {
      ent.progress = Math.min(100, (ent.progress ?? 0) + 2)
      if ((ent.remainingMinutes ?? 0) > 0) ent.remainingMinutes = (ent.remainingMinutes ?? 0) - 1
    }
  }
}

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

export function executeRuleAGroupTogether(): void {
  const pending = home.pendingMerge
  if (!pending) return
  const source = home.entities[pending.sourceId]
  const target = home.entities[pending.targetId]
  home.pendingMerge = null
  if (!source || !target) return

  const targetTitle = target.title
  target.title = `${target.title} + ${source.title}`
  target.span.c = Math.max(2, target.span.c)
  target.on = Boolean(target.on || source.on)
  target.brightness = Math.round(((target.brightness ?? 50) + (source.brightness ?? 50)) / 2)
  removeFromLane(source)
  showToast(`Zgrupowano „${source.title}” i „${targetTitle}” — sterowanie razem`)
}

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
  showToast(`Dodano „${source.title}” jako przycisk dodatkowy w „${target.title}”`)
}

function executeRuleB(source: Entity, target: Entity): void {
  target.nestedTiles = [...(target.nestedTiles ?? []), source.id]
  target.expanders.down = true
  target.expanders.right = true
  removeFromLane(source)
  home.modalEntityId = null
  showToast(`Zagnieżdżono „${source.title}” w „${target.title}”`)
}

function executeRuleC(source: Entity, target: Entity): void {
  const merged = [...(target.series ?? [])]
  for (const series of source.series ?? []) {
    if (!merged.some((candidate) => candidate.id === series.id)) merged.push(series)
  }
  target.series = merged
  target.title = `${target.title.replace(' 24h', '')} + ${source.title.replace(' 24h', '')}`
  target.span.c = Math.max(3, target.span.c)
  target.span.r = Math.max(3, target.span.r)
  removeFromLane(source)
  home.modalEntityId = null
  showToast(`Połączono wykresy w „${target.title}” — legenda wielosensorowa 3×3`)
}

export function unnestTile(host: Entity, nestedId: string): void {
  const nested = home.entities[nestedId]
  if (!nested) return
  host.nestedTiles = (host.nestedTiles ?? []).filter((id) => id !== nestedId)
  const lane = home.lanes.find((candidate) => candidate.id === nested.column)
  if (lane && !lane.entityIds.includes(nestedId)) lane.entityIds.push(nestedId)
  showToast(`Wypięto „${nested.title}” z powrotem na siatkę`)
}

export function resetAll(): void {
  home.entities = clone(rawEntities) as unknown as Record<string, Entity>
  home.lanes = clone(INITIAL_LANES) as Lane[]
  home.activeLaneIdx = 0
  home.modalEntityId = null
  home.pendingMerge = null
  home.toasts = []
  home.tileDragActive = false
}

export function setOrientation(orientation: Orientation): void {
  home.orientation = orientation
  home.activeLaneIdx = clamp(home.activeLaneIdx, 0, home.lanes.length - 1)
}

export function setPortraitTitlePos(pos: PortraitTitlePos): void {
  home.portraitTitlePos = pos
}
