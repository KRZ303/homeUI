<script setup lang="ts">
import { computed, type Component } from 'vue';
import { useHomeStore } from '../store';
import type { Entity } from '../types';

import SliderLightTile from './tiles/SliderLightTile.vue';
import GroupTile from './tiles/GroupTile.vue';
import ScenePillTile from './tiles/ScenePillTile.vue';
import VerticalBlindTile from './tiles/VerticalBlindTile.vue';
import SensorGraphTile from './tiles/SensorGraphTile.vue';
import ContextTile from './tiles/ContextTile.vue';
import HvacGlobalTile from './tiles/HvacGlobalTile.vue';
import ThermostatTile from './tiles/ThermostatTile.vue';
import AcTile from './tiles/AcTile.vue';
import TvTile from './tiles/TvTile.vue';
import DishwasherTile from './tiles/DishwasherTile.vue';
import RobotVacuumTile from './tiles/RobotVacuumTile.vue';
import CameraTile from './tiles/CameraTile.vue';
import LockTile from './tiles/LockTile.vue';
import SmokeTile from './tiles/SmokeTile.vue';
import HistoryTile from './tiles/HistoryTile.vue';
import FabricHubTile from './tiles/FabricHubTile.vue';

const props = withDefaults(defineProps<{ id: string; laneEntityIds?: string[]; nested?: boolean }>(), {
  laneEntityIds: () => [],
  nested: false,
});

const store = useHomeStore();
const ent = computed(() => store.entities[props.id]);

const ARCHETYPES: Record<Entity['type'], Component> = {
  slider_light: SliderLightTile,
  group_tile: GroupTile,
  scene_pill: ScenePillTile,
  vertical_blind: VerticalBlindTile,
  sensor_graph: SensorGraphTile,
  matter_context_tile: ContextTile,
  hvac_global_modes: HvacGlobalTile,
  simple_thermostat: ThermostatTile,
  rich_ac_row: AcTile,
  stateful_tv: TvTile,
  stateful_dishwasher: DishwasherTile,
  robot_vacuum_tile: RobotVacuumTile,
  webrtc_camera_tile: CameraTile,
  closure_lock_tile: LockTile,
  matter_smoke_alarm: SmokeTile,
  matter_event_history: HistoryTile,
  matter_fabric_hub: FabricHubTile,
};

const archetype = computed<Component>(() => ARCHETYPES[ent.value?.type ?? 'slider_light']);
</script>

<template>
  <TileFrame v-if="ent" :id="props.id">
    <component
      :is="archetype"
      :id="props.id"
      :span-c="ent.span.c"
      :span-r="ent.span.r"
      :lane-entity-ids="props.laneEntityIds"
      :nested="props.nested"
    />
  </TileFrame>
</template>

<script lang="ts">
import TileFrame from './TileFrame.vue';

export default {
  name: 'TileDispatcher',
  components: { TileFrame },
};
</script>
