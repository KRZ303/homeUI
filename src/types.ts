export type WidgetType =
  | 'slider_light'
  | 'group_tile'
  | 'scene_pill'
  | 'vertical_blind'
  | 'sensor_graph'
  | 'matter_context_tile'
  | 'hvac_global_modes'
  | 'simple_thermostat'
  | 'rich_ac_row'
  | 'stateful_tv'
  | 'stateful_dishwasher'
  | 'robot_vacuum_tile'
  | 'webrtc_camera_tile'
  | 'closure_lock_tile'
  | 'matter_smoke_alarm'
  | 'matter_event_history'
  | 'matter_fabric_hub'

export type Orientation = 'portrait' | 'landscape'
export type PortraitTitlePos = 'top' | 'left'
export type ExpanderKey = 'down' | 'right' | 'diagonal'
export type ExpandDirection = 'down' | 'right' | 'diagonal'

export interface Span {
  c: number
  r: number
}

export interface Expanders {
  down: boolean
  right: boolean
  diagonal: boolean
}

export interface ExpandedContent {
  secondaryButtons: boolean
  secondarySlider: boolean
  presets: boolean
}

export interface MainButton {
  id: string
  label: string
  icon: string
  iconType?: 'lucide' | 'mdi'
  active?: boolean
  showLabel?: boolean
  activeClass?: string
}

export interface SecondaryButton {
  id: string
  label: string
  icon: string
  iconType?: 'lucide' | 'mdi'
  active?: boolean
  brightness?: number
  type?: 'oval_pill' | 'ghost_momentary' | 'group_member'
}

export interface GroupMember {
  id: string
  label: string
  icon: string
  iconType?: 'lucide' | 'mdi'
  active: boolean
}

export interface SensorSeries {
  id: string
  label: string
  current: string
  unit: string
  color: string
  fill?: boolean
  min: string
  minTime: string
  max: string
  maxTime: string
  points: number[]
}

export interface MatterSuggestion {
  active: boolean
  suggestedTemp: number
  source: string
  status?: string
}

export interface SecurityEvent {
  time: string
  label: string
}

export interface Entity {
  id: string
  column: string
  type: WidgetType
  matterType: string
  title: string
  icon?: string
  iconType?: 'lucide' | 'mdi'
  span: Span
  defaultSpan: Span
  expanders: Expanders
  expandedContent: ExpandedContent
  nestedTiles: string[]
  mainButtons?: MainButton[]
  secondaryButtons?: SecondaryButton[]
  on?: boolean
  active?: boolean
  brightness?: number
  colorTemp?: number
  customSubtitle?: string
  hideSubtitleWhenOn?: boolean
  powerWatts?: string
  members?: GroupMember[]
  soilMoisture?: string
  series?: SensorSeries[]
  rightAxisMax?: string
  rightAxisMin?: string
  steppedAreaPoints?: number[]
  demand?: number
  targetTemp?: number
  measuredTemp?: number
  preset?: string
  matterSuggestion?: MatterSuggestion
  swing?: boolean
  fan?: boolean
  ionizer?: boolean
  fanSpeedPct?: number
  playing?: boolean
  source?: string
  volume?: number
  muted?: boolean
  state?: 'idle' | 'running' | 'paused'
  progress?: number
  remainingMinutes?: number
  delay?: string
  programme?: string
  cleanPlus?: boolean
  speedPlus?: boolean
  dryPlus?: boolean
  waterTemp?: number
  iconName?: string
  doorClosed?: boolean
  mode?: string
  battery?: number
  rooms?: string[]
  privacy?: boolean
  ptzPreset?: string
  detections?: string
  locked?: boolean
  position?: number
  tilt?: number
  lastActor?: string
  mounted?: boolean
  coPpm?: number
  armed?: boolean
  events?: SecurityEvent[]
  threadNodes?: number
  ecosystems?: string[]
  nfcReadyCount?: number
  activity?: string
  soundContext?: string
  prediction?: string
  modes?: { cool: boolean; auto: boolean; heat: boolean }
}

export interface TickerItem {
  icon: string
  iconType?: 'lucide' | 'mdi'
  text: string
}

export interface LaneTicker {
  leadIcon: string
  leadIconType?: 'lucide' | 'mdi'
  items: TickerItem[]
}

export interface Lane {
  id: string
  title: string
  subtitle: string
  coords: { x: number; y: number }
  ticker: LaneTicker
  entityIds: string[]
}
