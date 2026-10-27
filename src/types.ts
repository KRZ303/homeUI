export interface Span {
  c: number;
  r: number;
}

export type IconType = 'lucide' | 'mdi';

export interface MainButton {
  id: string;
  label: string;
  iconType?: IconType;
  icon: string;
  active?: boolean;
  showLabel?: boolean;
  customActiveClass?: string;
  iconColorClass?: string;
}

export type SecondaryButtonType = 'oval_pill' | 'ghost_momentary';

export interface SecondaryButton {
  id: string;
  label: string;
  icon?: string;
  iconType?: IconType;
  active: boolean;
  brightness?: number;
  type: SecondaryButtonType;
}

export interface GroupMember {
  id: string;
  label: string;
  iconType?: IconType;
  icon: string;
  active: boolean;
}

export interface Series {
  id: string;
  label: string;
  current: string;
  unit: string;
  color: string;
  fill?: boolean;
  strokeWidth?: number;
  min?: string;
  minTime?: string;
  max?: string;
  maxTime?: string;
  points: number[];
}

export interface MatterSuggestion {
  active: boolean;
  status: string;
  source: string;
  suggestedTemp: number;
}

export interface HistoryEvent {
  time: string;
  label: string;
}

export type EntityType =
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
  | 'matter_fabric_hub';

export type ApplianceState = 'idle' | 'running' | 'paused';

export interface Entity {
  id: string;
  column?: string;
  type: EntityType;
  matterType?: string;
  title: string;
  iconType?: IconType;
  icon?: string;
  iconName?: string;
  iconColorClass?: string;

  // slider_light (also used as base for heat pump, purifier, fridge, oven, PV, BESS)
  on?: boolean;
  brightness?: number;
  colorTemp?: number;
  powerWatts?: string;
  hideSubtitleWhenOn?: boolean;
  customSubtitle?: string;

  // group_tile
  members?: GroupMember[];
  soilMoisture?: string;

  // scene_pill
  active?: boolean;
  activity?: string;
  soundContext?: string;
  prediction?: string;

  // vertical_blind
  position?: number;
  tilt?: number;

  // sensor_graph
  series?: Series[];
  rightAxisMax?: string;
  rightAxisMin?: string;
  steppedAreaPoints?: number[];

  // hvac_global_modes
  modes?: { cool: boolean; auto: boolean; heat: boolean };

  // simple_thermostat
  demand?: number;
  targetTemp?: number;
  measuredTemp?: number;
  preset?: string;
  matterSuggestion?: MatterSuggestion;

  // rich_ac_row
  swing?: boolean;
  fan?: boolean;
  ionizer?: boolean;
  fanSpeedPct?: number;

  // stateful_tv
  playing?: boolean;
  source?: string;
  volume?: number;
  muted?: boolean;

  // stateful_dishwasher
  doorClosed?: boolean;
  state?: ApplianceState;
  progress?: number;
  remainingMinutes?: number;
  delay?: string;
  programme?: string;
  cleanPlus?: boolean;
  speedPlus?: boolean;
  dryPlus?: boolean;
  waterTemp?: number;

  // robot_vacuum_tile
  mode?: string;
  battery?: number;
  rooms?: string[];

  // webrtc_camera_tile
  privacy?: boolean;
  ptzPreset?: string;
  detections?: string;

  // closure_lock_tile
  locked?: boolean;
  lastActor?: string;

  // matter_smoke_alarm
  mounted?: boolean;
  coPpm?: number;

  // matter_event_history
  armed?: boolean;
  events?: HistoryEvent[];

  // matter_fabric_hub
  threadNodes?: number;
  ecosystems?: string[];
  nfcReadyCount?: number;

  span: Span;
  defaultSpan: Span;
  expanders: { down: boolean; right: boolean; diagonal: boolean };
  expandedContent: { secondaryButtons: boolean; secondarySlider: boolean; presets: boolean };
  nestedTiles: string[];
  mainButtons?: MainButton[];
  secondaryButtons?: SecondaryButton[];
}

export interface TickerItem {
  icon: string;
  text: string;
}

export interface Lane {
  id: string;
  title: string;
  subtitle: string;
  x: number;
  ticker: { lead: string; items: TickerItem[] };
  entityIds: string[];
}

export interface Toast {
  id: number;
  text: string;
}
