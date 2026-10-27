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

export interface Span { c: number; r: number }
export interface TileButton {
  id: string
  label: string
  icon: string
  iconType?: 'lucide' | 'mdi'
  active?: boolean
  showLabel?: boolean
  type?: 'oval_pill' | 'ghost_momentary'
  brightness?: number
}
export interface GraphSeries {
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
export interface Device {
  id: string
  column: string
  type: WidgetType
  matterType: string
  title: string
  icon?: string
  iconType?: 'lucide' | 'mdi'
  iconName?: string
  span: Span
  defaultSpan: Span
  expanders: { down: boolean; right: boolean; diagonal: boolean }
  expandedContent: { secondaryButtons: boolean; secondarySlider: boolean; presets: boolean }
  nestedTiles: string[]
  mainButtons?: TileButton[]
  secondaryButtons?: TileButton[]
  members?: TileButton[]
  series?: GraphSeries[]
  on?: boolean
  active?: boolean
  brightness?: number
  customSubtitle?: string
  powerWatts?: string
  colorTemp?: number
  position?: number
  tilt?: number
  soilMoisture?: string
  activity?: string
  soundContext?: string
  prediction?: string
  modes?: { cool: boolean; auto: boolean; heat: boolean }
  demand?: number
  targetTemp?: number
  measuredTemp?: number
  matterSuggestion?: { active: boolean; suggestedTemp: number; source: string; status: string }
  fanSpeedPct?: number
  volume?: number
  source?: string
  playing?: boolean
  state?: 'idle' | 'running' | 'paused'
  progress?: number
  remainingMinutes?: number
  delay?: string
  programme?: string
  cleanPlus?: boolean
  speedPlus?: boolean
  dryPlus?: boolean
  battery?: number
  mode?: string
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
  steppedAreaPoints?: number[]
  [key: string]: unknown
}
export interface Lane {
  id: string
  title: string
  subtitle: string
  leadIcon: string
  ticker: { icon: string; text: string }[]
  entityIds: string[]
}
export type HomeState = { entities: Record<string, Device>; lanes: Lane[] }
