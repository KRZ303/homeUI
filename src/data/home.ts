import specification from '../../ETS_Smart_Home_UI_Specification_V4_Final_Approved.md?raw'
import type { Device, HomeState, Lane } from '../types'

const payload = specification.split('### 8.6 Complete Initial State JSON Payload')[1]
const json = payload.match(/```json\s*([\s\S]*?)\s*```/)?.[1]
if (!json) throw new Error('Nie znaleziono danych początkowych ETS w specyfikacji.')

export const initialEntities = JSON.parse(json) as Record<string, Device>

export const initialLanes: Lane[] = [
  {
    id: 'lights', title: 'Salon & Światła', subtitle: 'Oświetlenie, grupy, rolety i kontekst AI', leadIcon: 'Sun',
    ticker: [{ icon: 'Thermometer', text: '10,99 °C' }, { icon: 'Droplets', text: '74,2%' }, { icon: 'Gauge', text: '981,0 hPa' }, { icon: 'Cloud', text: 'pochmurno' }],
    entityIds: ['light_salon', 'light_tv', 'light_kuchnia', 'group_roslinki', 'light_lozko', 'light_lampka', 'scene_sen', 'sensor_lux_salon', 'cover_roleta', 'plug_biurko', 'speaker_salon', 'ambient_context_salon'],
  },
  {
    id: 'climate', title: 'Klimat & HVAC', subtitle: 'Termostaty Matter 1.6, wykresy 24h, AC i powietrze', leadIcon: 'Home',
    ticker: [{ icon: 'Sofa', text: '24,37 °C  41,8%' }, { icon: 'Bed', text: '22,52 °C  45,9%' }, { icon: 'Building2', text: '23,40 °C  43,5%' }],
    entityIds: ['sensor_multi_heating_3x3', 'sensor_co2_1x1', 'sensor_balkon_1x1', 'sensor_lazienka_1x1', 'sensor_salon_2x2', 'sensor_biuro_2x2', 'hvac_global', 'thermostat_biuro', 'thermostat_salon', 'thermostat_sypialnia', 'ac_salon', 'ac_sypialnia', 'heat_pump_dom', 'air_purifier_salon', 'water_heater_cwu', 'ventilation_reku'],
  },
  {
    id: 'appliances', title: 'Kuchnia & AGD', subtitle: 'Urządzenia stanowe, cykle, chłodzenie i roboty', leadIcon: 'Utensils',
    ticker: [{ icon: 'Zap', text: '1,42 kW' }, { icon: 'Droplets', text: '9,8 L / cykl' }, { icon: 'Tv', text: 'Matter Casting' }],
    entityIds: ['media_tv', 'appliance_zmywara', 'appliance_pralka', 'appliance_lodowka', 'appliance_piekarnik', 'robot_roborock'],
  },
  {
    id: 'security', title: 'Bezpieczeństwo', subtitle: 'Kamery WebRTC, zamki UWB, bramy i historia Matter 1.6', leadIcon: 'Shield',
    ticker: [{ icon: 'Lock', text: 'Zamknięte (4/4)' }, { icon: 'Camera', text: '2 kamery WebRTC' }, { icon: 'Droplets', text: 'Gleba 58%' }],
    entityIds: ['camera_ogrod', 'doorbell_furta', 'lock_wejscie', 'garage_gate', 'alarm_smoke_co', 'water_valve_ogrod', 'security_history'],
  },
  {
    id: 'energy', title: 'Energia & Matter 1.6', subtitle: 'Fotowoltaika, magazyn BESS, Wallbox V2H i Joint Fabric', leadIcon: 'Zap',
    ticker: [{ icon: 'Sun', text: '+3,85 kW PV' }, { icon: 'BatteryCharging', text: '86% BESS' }, { icon: 'Car', text: 'EV 78% (V2H)' }, { icon: 'Wifi', text: 'Joint Fabric OK' }],
    entityIds: ['solar_pv', 'home_battery', 'ev_wallbox', 'matter_joint_fabric'],
  },
]

export function createInitialState(): HomeState {
  return structuredClone({ entities: initialEntities, lanes: initialLanes })
}
