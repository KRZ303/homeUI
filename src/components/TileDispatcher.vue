<script setup lang="ts">
import { type Component } from 'vue'
import type { Entity, WidgetType } from '../types'
import SliderLightTile from './tiles/SliderLightTile.vue'
import GroupTile from './tiles/GroupTile.vue'
import SceneTile from './tiles/SceneTile.vue'
import VerticalBlindTile from './tiles/VerticalBlindTile.vue'
import SensorTile from './tiles/SensorTile.vue'
import ContextTile from './tiles/ContextTile.vue'
import HvacTile from './tiles/HvacTile.vue'
import ThermostatTile from './tiles/ThermostatTile.vue'
import AcTile from './tiles/AcTile.vue'
import TvTile from './tiles/TvTile.vue'
import ApplianceTile from './tiles/ApplianceTile.vue'
import VacuumTile from './tiles/VacuumTile.vue'
import CameraTile from './tiles/CameraTile.vue'
import LockTile from './tiles/LockTile.vue'
import SmokeTile from './tiles/SmokeTile.vue'
import HistoryTile from './tiles/HistoryTile.vue'
import FabricTile from './tiles/FabricTile.vue'

defineProps<{ entity: Entity }>()

const WIDGETS: Record<WidgetType, Component> = {
  slider_light: SliderLightTile,
  group_tile: GroupTile,
  scene_pill: SceneTile,
  vertical_blind: VerticalBlindTile,
  sensor_graph: SensorTile,
  matter_context_tile: ContextTile,
  hvac_global_modes: HvacTile,
  simple_thermostat: ThermostatTile,
  rich_ac_row: AcTile,
  stateful_tv: TvTile,
  stateful_dishwasher: ApplianceTile,
  robot_vacuum_tile: VacuumTile,
  webrtc_camera_tile: CameraTile,
  closure_lock_tile: LockTile,
  matter_smoke_alarm: SmokeTile,
  matter_event_history: HistoryTile,
  matter_fabric_hub: FabricTile,
}
</script>

<template>
  <component :is="WIDGETS[entity.type]" :entity="entity" />
</template>
