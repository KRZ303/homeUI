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
export type DragMode = 'none' | 'horizontal' | 'vertical'

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
  type?: 'oval_pill' | 'ghost_momentary'
}

export interface Series {
  id: string
  label: string
  current: string
  unit: string
  color: string
  fill?: boolean
  min?: string
  minTime?: string
  max?: string
  maxTime?: string
  points: number[]
}

export interface TickerItem {
  icon: string
  iconType?: 'lucide' | 'mdi'
  text: string
}

export interface Lane {
  id: string
  title: string
  subtitle?: string
  coords: { x: number; y: number }
  ticker: {
    leadIcon: string
    leadIconType?: 'lucide' | 'mdi'
    items: TickerItem[]
  }
  entityIds: string[]
}

export interface Entity {
  id: string
  column: string
  type: WidgetType
  matterType: string
  title: string
  iconType?: 'lucide' | 'mdi'
  icon?: string
  iconName?: string
  on?: boolean
  active?: boolean
  brightness?: number
  colorTemp?: number
  customSubtitle?: string
  powerWatts?: string
  hideSubtitleWhenOn?: boolean
  span: Span
  defaultSpan: Span
  expanders: Expanders
  expandedContent: ExpandedContent
  nestedTiles: string[]
  mainButtons?: MainButton[]
  secondaryButtons?: SecondaryButton[]
  members?: SecondaryButton[]
  soilMoisture?: string
  series?: Series[]
  rightAxisMax?: string
  rightAxisMin?: string
  steppedAreaPoints?: number[]
  position?: number
  tilt?: number
  modes?: { cool: boolean; auto: boolean; heat: boolean }
  demand?: number
  targetTemp?: number
  measuredTemp?: number
  preset?: string
  matterSuggestion?: {
    active: boolean
    suggestedTemp: number
    source: string
    status?: string
  }
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
  doorClosed?: boolean
  mode?: string
  battery?: number
  rooms?: string[]
  privacy?: boolean
  ptzPreset?: string
  detections?: string
  locked?: boolean
  lastActor?: string
  mounted?: boolean
  coPpm?: number
  armed?: boolean
  events?: { time: string; label: string }[]
  threadNodes?: number
  ecosystems?: string[]
  nfcReadyCount?: number
  activity?: string
  soundContext?: string
  prediction?: string
}
