import type { Device, HomeState, Room } from '../types';

const deviceList: Device[] = [
  { id: 'living-lights', roomId: 'living', name: 'Ceiling lights', kind: 'light', footprint: { columns: 2, rows: 2 }, active: true, brightness: 72, canExpand: true, acceptsChildren: true, children: [], detail: 'Warm white · 2700 K' },
  { id: 'reading-light', roomId: 'living', name: 'Reading', kind: 'light', footprint: { columns: 1, rows: 1 }, active: false, brightness: 60, detail: 'Floor lamp beside the sofa' },
  { id: 'floor-light', roomId: 'living', name: 'Floor wash', kind: 'light', footprint: { columns: 1, rows: 1 }, active: true, brightness: 45, detail: 'Indirect wall lighting' },
  { id: 'living-tv', roomId: 'living', name: 'Television', kind: 'media', footprint: { columns: 2, rows: 1 }, active: true, playing: true, volume: 34, track: 0, tracks: ['Evening jazz', 'The daily news', 'Ambient film'], canExpand: true, detail: 'Living room display and speakers' },
  { id: 'evening-scene', roomId: 'living', name: 'Evening', kind: 'scene', footprint: { columns: 1, rows: 1 }, active: false, detail: 'Dim lights and lower the shades' },
  { id: 'living-air', roomId: 'living', name: 'Air quality', kind: 'sensor', footprint: { columns: 1, rows: 1 }, active: true, value: 46, unit: '%', detail: 'Relative humidity · good' },
  { id: 'living-climate', roomId: 'living', name: 'Climate', kind: 'climate', footprint: { columns: 4, rows: 1 }, active: true, currentTemperature: 21.4, targetTemperature: 22, mode: 'heat', modes: ['off', 'heat', 'cool', 'auto'], canExpand: true, detail: 'Radiant floor and ventilation' },

  { id: 'kitchen-lights', roomId: 'kitchen', name: 'Kitchen lights', kind: 'light', footprint: { columns: 2, rows: 1 }, active: true, brightness: 84, canExpand: true, acceptsChildren: true, children: [], detail: 'Ceiling and preparation lighting' },
  { id: 'counter-light', roomId: 'kitchen', name: 'Counter', kind: 'light', footprint: { columns: 1, rows: 1 }, active: true, brightness: 64, detail: 'Under-cabinet task light' },
  { id: 'coffee-scene', roomId: 'kitchen', name: 'Coffee', kind: 'scene', footprint: { columns: 1, rows: 1 }, active: false, detail: 'Start the morning routine' },
  { id: 'dishwasher', roomId: 'kitchen', name: 'Dishwasher', kind: 'dishwasher', footprint: { columns: 4, rows: 1 }, active: false, program: 'Eco 50°', programs: ['Eco 50°', 'Auto 55°', 'Intensive 70°'], options: ['Speed+', 'Extra dry'], selectedOptions: ['Speed+'], running: false, progress: 0, canExpand: true, detail: 'Connected dishwasher · salt and rinse aid OK' },
  { id: 'fridge', roomId: 'kitchen', name: 'Fridge', kind: 'sensor', footprint: { columns: 1, rows: 1 }, active: true, value: 4, unit: '°', detail: 'Temperature is stable' },
  { id: 'kitchen-sensor', roomId: 'kitchen', name: 'Air quality', kind: 'sensor', footprint: { columns: 1, rows: 1 }, active: true, value: 612, unit: ' ppm', detail: 'CO₂ · ventilation not needed' },
  { id: 'dining-light', roomId: 'kitchen', name: 'Dining', kind: 'light', footprint: { columns: 2, rows: 1 }, active: false, brightness: 50, detail: 'Pendant above the dining table' },

  { id: 'bedroom-lights', roomId: 'bedroom', name: 'Bedroom lights', kind: 'light', footprint: { columns: 2, rows: 2 }, active: false, brightness: 30, canExpand: true, acceptsChildren: true, children: [], detail: 'Soft warm lighting' },
  { id: 'bedside-left', roomId: 'bedroom', name: 'Left bedside', kind: 'light', footprint: { columns: 1, rows: 1 }, active: false, brightness: 25, detail: 'Left reading light' },
  { id: 'bedside-right', roomId: 'bedroom', name: 'Right bedside', kind: 'light', footprint: { columns: 1, rows: 1 }, active: true, brightness: 18, detail: 'Right reading light' },
  { id: 'sleep-scene', roomId: 'bedroom', name: 'Sleep', kind: 'scene', footprint: { columns: 2, rows: 1 }, active: false, detail: 'Lights out, climate to 19°' },
  { id: 'bedroom-climate', roomId: 'bedroom', name: 'Thermostat', kind: 'climate', footprint: { columns: 2, rows: 1 }, active: true, currentTemperature: 20.1, targetTemperature: 19, mode: 'heat', modes: ['off', 'heat', 'auto'], canExpand: true, detail: 'Bedroom radiator' },
  { id: 'bedroom-air', roomId: 'bedroom', name: 'Humidity', kind: 'sensor', footprint: { columns: 1, rows: 1 }, active: true, value: 43, unit: '%', detail: 'Relative humidity · comfortable' },
  { id: 'bedroom-noise', roomId: 'bedroom', name: 'Sound', kind: 'sensor', footprint: { columns: 1, rows: 1 }, active: true, value: 28, unit: ' dB', detail: 'Quiet' },

  { id: 'studio-lights', roomId: 'studio', name: 'Studio lights', kind: 'light', footprint: { columns: 2, rows: 1 }, active: true, brightness: 90, canExpand: true, acceptsChildren: true, children: [], detail: 'Daylight white · 4000 K' },
  { id: 'desk-light', roomId: 'studio', name: 'Desk', kind: 'light', footprint: { columns: 1, rows: 1 }, active: true, brightness: 75, detail: 'Adjustable task light' },
  { id: 'focus-scene', roomId: 'studio', name: 'Focus', kind: 'scene', footprint: { columns: 1, rows: 1 }, active: true, detail: 'Bright light and quiet climate' },
  { id: 'studio-ac', roomId: 'studio', name: 'Air conditioner', kind: 'climate', footprint: { columns: 4, rows: 2 }, active: true, currentTemperature: 23.2, targetTemperature: 21, mode: 'cool', modes: ['off', 'cool', 'heat', 'fan', 'auto'], canExpand: true, detail: 'Quiet mode · swing enabled' },
  { id: 'studio-display', roomId: 'studio', name: 'Studio display', kind: 'media', footprint: { columns: 2, rows: 1 }, active: false, playing: false, volume: 20, track: 0, tracks: ['Focus mix', 'Design podcast'], canExpand: true, detail: 'Desktop display and audio' },
  { id: 'studio-air', roomId: 'studio', name: 'CO₂', kind: 'sensor', footprint: { columns: 1, rows: 1 }, active: true, value: 540, unit: ' ppm', detail: 'Air quality · excellent' },
];

const rooms: Room[] = [
  { id: 'living', name: 'Living room', note: 'A softer evening, already in motion.', temperature: 21.4, humidity: 46, deviceIds: [] },
  { id: 'kitchen', name: 'Kitchen', note: 'Everything in its place.', temperature: 22.1, humidity: 49, deviceIds: [] },
  { id: 'bedroom', name: 'Bedroom', note: 'Quiet, dim, and nearly ready for sleep.', temperature: 20.1, humidity: 43, deviceIds: [] },
  { id: 'studio', name: 'Studio', note: 'A clear space for focused work.', temperature: 23.2, humidity: 41, deviceIds: [] },
];

export const initialHomeState: HomeState = {
  rooms: rooms.map((room) => ({
    ...room,
    deviceIds: deviceList.filter((device) => device.roomId === room.id).map((device) => device.id),
  })),
  devices: Object.fromEntries(deviceList.map((device) => [device.id, device])),
};
