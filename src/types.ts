export type DeviceKind = 'light' | 'climate' | 'media' | 'dishwasher' | 'scene' | 'sensor';

export interface Footprint {
  columns: number;
  rows: number;
}

export interface Device {
  id: string;
  roomId: string;
  name: string;
  kind: DeviceKind;
  footprint: Footprint;
  active: boolean;
  canExpand?: boolean;
  expanded?: boolean;
  acceptsChildren?: boolean;
  children?: string[];
  groupedInto?: string;
  brightness?: number;
  currentTemperature?: number;
  targetTemperature?: number;
  temperatureUnit?: string;
  mode?: string;
  modes?: string[];
  playing?: boolean;
  volume?: number;
  track?: number;
  tracks?: string[];
  program?: string;
  programs?: string[];
  options?: string[];
  selectedOptions?: string[];
  running?: boolean;
  progress?: number;
  value?: number;
  unit?: string;
  detail?: string;
}

export interface Room {
  id: string;
  name: string;
  note: string;
  temperature: number;
  humidity: number;
  deviceIds: string[];
}

export interface HomeState {
  rooms: Room[];
  devices: Record<string, Device>;
}

export type HomeAction =
  | { type: 'toggle-device'; deviceId: string }
  | { type: 'set-brightness'; deviceId: string; value: number }
  | { type: 'set-target'; deviceId: string; value: number }
  | { type: 'set-mode'; deviceId: string; mode: string }
  | { type: 'toggle-playback'; deviceId: string }
  | { type: 'set-volume'; deviceId: string; value: number }
  | { type: 'change-track'; deviceId: string; delta: number }
  | { type: 'toggle-expanded'; deviceId: string }
  | { type: 'set-expanded'; deviceId: string; value: boolean }
  | { type: 'set-program'; deviceId: string; program: string }
  | { type: 'toggle-option'; deviceId: string; option: string }
  | { type: 'start-dishwasher'; deviceId: string }
  | { type: 'tick-dishwashers' }
  | { type: 'group-device'; sourceId: string; targetId: string }
  | { type: 'ungroup-device'; deviceId: string };

export function getDeviceStatus(device: Device): string {
  switch (device.kind) {
    case 'light':
      return device.active ? `${device.brightness ?? 100}% brightness` : 'Off';
    case 'climate':
      return device.mode === 'off' ? 'Off' : `${device.currentTemperature ?? '—'}° inside`;
    case 'media':
      if (!device.active) return 'Off';
      if (!device.playing) return 'Paused';
      return device.tracks?.[device.track ?? 0] ?? 'Playing in this room';
    case 'dishwasher':
      if (device.running) return `${device.progress ?? 0}% · ${device.program}`;
      return device.progress === 100 ? 'Cycle complete' : device.program ?? 'Ready';
    case 'scene':
      return device.active ? 'Active' : 'Ready';
    case 'sensor':
      return `${device.value ?? '—'}${device.unit ?? ''}`;
  }
}
