import { reactive, ref, type Ref } from 'vue';
import type { Entity, Lane, MainButton, Series, Toast } from './types';
import { INITIAL_ENTITIES, deepClone } from './data/entities';
import { INITIAL_LANES } from './data/lanes';

type Direction = 'down' | 'right' | 'diagonal';

export interface MergeChoice {
  sourceId: string;
  targetId: string;
}

const state = {
  entities: reactive(deepClone(INITIAL_ENTITIES)) as Record<string, Entity>,
  lanes: reactive(deepClone(INITIAL_LANES)) as Lane[],
  activeLaneIdx: ref<number>(0),
  orientation: ref<'portrait' | 'landscape'>('portrait'),
  portraitTitlePos: ref<'top' | 'left'>('top'),
  modalEntityId: ref<string | null>(null),
  pendingMergeChoice: ref<MergeChoice | null>(null),
  dragTileId: ref<string | null>(null),
  dropTargetId: ref<string | null>(null),
  hoverLaneId: ref<string | null>(null),
  toasts: ref<Toast[]>([]),
  swiping: ref(false),
};

let toastSeq = 0;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

export interface HomeStore {
  entities: Record<string, Entity>;
  lanes: Lane[];
  activeLaneIdx: Ref<number>;
  orientation: Ref<'portrait' | 'landscape'>;
  portraitTitlePos: Ref<'top' | 'left'>;
  modalEntityId: Ref<string | null>;
  pendingMergeChoice: Ref<MergeChoice | null>;
  dragTileId: Ref<string | null>;
  dropTargetId: Ref<string | null>;
  hoverLaneId: Ref<string | null>;
  toasts: Ref<Toast[]>;
  swiping: Ref<boolean>;
  patch: (id: string, p: Partial<Entity>) => void;
  toast: (text: string) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  handleIconTap: (id: string) => void;
  toggleMainButton: (id: string, button: MainButton) => void;
  toggleCrossMember: (id: string, memberId: string) => void;
  toggleSecondary: (id: string, buttonId: string) => void;
  triggerMomentary: (id: string, buttonId: string) => void;
  expandTile: (id: string, dir: Direction) => void;
  cycleSensorFootprint: (id: string) => void;
  setSpan: (id: string, span: { c: number; r: number }) => void;
  handleDropTileOnTile: (sourceId: string, targetId: string) => void;
  applyCloseLabel: (mode: 'group' | 'secondary') => void;
  cancelMergeChoice: () => void;
  unnestTile: (hostId: string, nestedId: string) => void;
  removeEntity: (id: string) => void;
  resetPrototype: () => void;
}

const store: HomeStore = {
  entities: state.entities,
  lanes: state.lanes,
  activeLaneIdx: state.activeLaneIdx,
  orientation: state.orientation,
  portraitTitlePos: state.portraitTitlePos,
  modalEntityId: state.modalEntityId,
  pendingMergeChoice: state.pendingMergeChoice,
  dragTileId: state.dragTileId,
  dropTargetId: state.dropTargetId,
  hoverLaneId: state.hoverLaneId,
  toasts: state.toasts,
  swiping: state.swiping,

  patch(id, p) {
    const ent = state.entities[id];
    if (!ent) return;
    Object.assign(ent, p);
  },

  toast(text) {
    if (toastTimer) clearTimeout(toastTimer);
    state.toasts.value = [{ id: ++toastSeq, text }];
    toastTimer = setTimeout(() => {
      state.toasts.value = [];
    }, 3400);
  },

  openModal(id) {
    state.modalEntityId.value = id;
  },

  closeModal() {
    state.modalEntityId.value = null;
  },

  handleIconTap(id) {
    const e = state.entities[id];
    if (!e) return;
    switch (e.type) {
      case 'slider_light':
        store.patch(id, { on: !e.on });
        break;
      case 'stateful_tv':
        store.patch(id, { on: !e.on });
        break;
      case 'rich_ac_row':
        store.patch(id, { on: !e.on });
        break;
      case 'robot_vacuum_tile':
        store.patch(id, { on: !e.on });
        if (e.on) store.patch(id, { progress: 0 });
        break;
      case 'group_tile': {
        const members = e.members ?? [];
        const anyActive = members.some((m) => m.active);
        for (const m of members) m.active = !anyActive;
        break;
      }
      case 'scene_pill': {
        const next = !e.active;
        store.patch(id, { active: next });
        window.setTimeout(() => {
          if (state.entities[id]?.active === next) store.patch(id, { active: false });
        }, 650);
        break;
      }
      case 'vertical_blind':
        store.patch(id, { position: (e.position ?? 0) > 0 ? 0 : 100 });
        break;
      case 'sensor_graph':
        store.cycleSensorFootprint(id);
        break;
      case 'hvac_global_modes': {
        const m = e.modes ?? { cool: false, auto: true, heat: true };
        const allOn = m.cool && m.auto && m.heat;
        store.patch(id, {
          modes: allOn ? { cool: false, auto: false, heat: false } : { cool: true, auto: true, heat: true },
        });
        break;
      }
      case 'simple_thermostat': {
        const heating = (e.demand ?? 0) > 0;
        if (heating) store.patch(id, { demand: 0, targetTemp: 19.0 });
        else store.patch(id, { demand: 55, targetTemp: 24.0 });
        break;
      }
      case 'stateful_dishwasher': {
        if (e.state === 'idle') store.patch(id, { state: 'running', progress: 24, remainingMinutes: 82 });
        else if (e.state === 'running') store.patch(id, { state: 'paused' });
        else store.patch(id, { state: 'running' });
        break;
      }
      case 'webrtc_camera_tile':
        store.patch(id, { privacy: !e.privacy });
        break;
      case 'closure_lock_tile':
        store.patch(id, { locked: !e.locked });
        break;
      case 'matter_smoke_alarm':
        store.patch(id, { mounted: !e.mounted });
        if (e.mounted) store.toast('UWAGA: Zdjęto czujnik z uchwytu sufitowego!');
        break;
      case 'matter_event_history':
        store.patch(id, { armed: !e.armed });
        break;
      case 'matter_fabric_hub':
        store.patch(id, { threadNodes: (e.threadNodes ?? 0) + 1 });
        store.toast('Zbliżono telefon NFC: Sparowano nowe urządzenie Matter 1.6 bez zasilania!');
        break;
    }
  },

  toggleMainButton(id, button) {
    const e = state.entities[id];
    if (!e) return;
    if (e.type === 'hvac_global_modes' && e.modes) {
      const key = button.id as 'cool' | 'auto' | 'heat';
      store.patch(id, { modes: { ...e.modes, [key]: !e.modes[key] } });
      return;
    }
    if (e.type === 'simple_thermostat') {
      if (button.id === 'down') store.patch(id, { targetTemp: Math.round(((e.targetTemp ?? 20) - 0.5) * 2) / 2 });
      else if (button.id === 'up') store.patch(id, { targetTemp: Math.round(((e.targetTemp ?? 20) + 0.5) * 2) / 2 });
      else if (button.id === 'suggest' && e.matterSuggestion?.active) {
        store.patch(id, { targetTemp: e.matterSuggestion.suggestedTemp, demand: 55 });
        store.toast(`${e.matterSuggestion.source}: przyjęto sugestię ${e.matterSuggestion.suggestedTemp}°C`);
      }
      return;
    }
    if (e.type === 'rich_ac_row' && button.id === 'target') {
      const nextT = Math.min(28, (e.targetTemp ?? 22) + 0.5);
      store.patch(id, { targetTemp: nextT > 28 ? 16.5 : nextT });
      return;
    }
    if (e.type === 'stateful_tv') {
      if (button.id === 'source') {
        const sources = ['Netflix • 4K', 'PS5 • HDR', 'Matter Cast'];
        const idx = sources.indexOf(e.source ?? '');
        store.patch(id, { source: sources[(idx + 1) % sources.length], on: true });
      } else if (button.id === 'pause') {
        store.patch(id, { playing: !e.playing });
      } else if (button.id === 'power') {
        store.patch(id, { on: !e.on });
      }
      if (button.id !== 'power') button.active = !button.active;
      return;
    }
    if (e.type === 'stateful_dishwasher') {
      if (button.id === 'delay') {
        const delayOptions = ['0:00', '1:00', '2:00', '4:00'];
        const idx = delayOptions.indexOf(e.delay ?? '0:00');
        store.patch(id, { delay: delayOptions[(idx + 1) % delayOptions.length] });
      } else if (button.id === 'start') {
        store.patch(id, { state: 'running', progress: 24, remainingMinutes: 82 });
      } else if (button.id === 'pause') {
        store.patch(id, { state: e.state === 'paused' ? 'running' : 'paused' });
      } else if (button.id === 'finish') {
        store.patch(id, { state: 'idle', progress: 0 });
      }
      return;
    }
    if (e.type === 'matter_fabric_hub') {
      store.toast(`Joint Fabric Datastore: klucze zsynchronizowane z ${button.label}`);
      return;
    }
    const btn = (e.mainButtons ?? []).find((b) => b.id === button.id);
    if (btn) btn.active = !btn.active;
  },

  toggleCrossMember(id, memberId) {
    const e = state.entities[id];
    const m = (e?.members ?? []).find((x) => x.id === memberId);
    if (m) m.active = !m.active;
  },

  toggleSecondary(id, buttonId) {
    const e = state.entities[id];
    const btn = (e?.secondaryButtons ?? []).find((b) => b.id === buttonId);
    if (btn) btn.active = !btn.active;
  },

  triggerMomentary(id, buttonId) {
    const e = state.entities[id];
    const btn = (e?.secondaryButtons ?? []).find((b) => b.id === buttonId);
    if (!btn) return;
    btn.active = true;
    window.setTimeout(() => {
      if (btn) btn.active = false;
    }, 650);
  },

  expandTile(id, dir) {
    const e = state.entities[id];
    if (!e) return;
    if (dir === 'diagonal' && e.type === 'sensor_graph') {
      store.cycleSensorFootprint(id);
      return;
    }
    if (dir === 'diagonal') {
      if (e.span.c > e.defaultSpan.c || e.span.r > e.defaultSpan.r) {
        e.span = { ...e.defaultSpan };
      } else {
        e.span = { c: Math.min(4, e.span.c + 1), r: Math.min(3, e.span.r + 1) };
      }
      return;
    }
    if (dir === 'down') {
      const minR = e.type === 'vertical_blind' ? 3 : e.defaultSpan.r;
      if (e.span.r >= 3) e.span = { ...e.span, r: Math.max(minR, e.defaultSpan.r) };
      else e.span = { ...e.span, r: Math.min(3, e.span.r + 1) };
      return;
    }
    const minC = isSliderBased(e) || e.type === 'vertical_blind' ? 2 : e.defaultSpan.c;
    if (e.span.c >= 4) e.span = { ...e.span, c: Math.max(minC, e.defaultSpan.c) };
    else e.span = { ...e.span, c: Math.min(4, e.span.c + 1) };
  },

  cycleSensorFootprint(id) {
    const e = state.entities[id];
    if (!e || e.type !== 'sensor_graph') return;
    const order = [
      { c: 1, r: 1 },
      { c: 2, r: 2 },
      { c: 3, r: 3 },
    ];
    const idx = order.findIndex((s) => s.c === e.span.c && s.r === e.span.r);
    const next = order[(idx + 1) % order.length];
    e.span = { ...next };
  },

  setSpan(id, span) {
    store.patch(id, { span: { ...span } });
  },

  handleDropTileOnTile(sourceId, targetId) {
    if (sourceId === targetId) return;
    const sourceEnt = state.entities[sourceId];
    const targetEnt = state.entities[targetId];
    if (!sourceEnt || !targetEnt) return;
    if (sourceEnt.type === 'sensor_graph' && targetEnt.type === 'sensor_graph') {
      executeRuleCSensorMerge(targetId, sourceId);
      return;
    }
    if (isSimpleEntity(sourceEnt) && (isSimpleEntity(targetEnt) || targetEnt.type === 'slider_light')) {
      state.pendingMergeChoice.value = { sourceId, targetId };
      return;
    }
    executeRuleBNest(targetId, sourceId);
  },

  applyCloseLabel(mode) {
    const choice = state.pendingMergeChoice.value;
    if (!choice) return;
    if (mode === 'group') executeRuleAGroupTogether(choice.targetId, choice.sourceId);
    else executeRuleAAddAsSecondaryButton(choice.targetId, choice.sourceId);
    state.pendingMergeChoice.value = null;
  },

  cancelMergeChoice() {
    state.pendingMergeChoice.value = null;
  },

  unnestTile(hostId, nestedId) {
    const e = state.entities[hostId];
    if (!e) return;
    e.nestedTiles = e.nestedTiles.filter((x) => x !== nestedId);
    for (const lane of state.lanes) {
      const idx = lane.entityIds.indexOf(hostId);
      if (idx !== -1) {
        lane.entityIds.splice(idx + 1, 0, nestedId);
        store.toast(`Wypnięto "${state.entities[nestedId]?.title ?? nestedId}" z powrotem na siatkę`);
        return;
      }
    }
  },

  removeEntity(id) {
    for (const lane of state.lanes) {
      const idx = lane.entityIds.indexOf(id);
      if (idx !== -1) {
        lane.entityIds.splice(idx, 1);
        return;
      }
    }
  },

  resetPrototype() {
    const entities = deepClone(INITIAL_ENTITIES);
    for (const key of Object.keys(state.entities)) delete state.entities[key];
    for (const key of Object.keys(entities)) state.entities[key] = entities[key];
    state.lanes.splice(0, state.lanes.length, ...deepClone(INITIAL_LANES));
    state.activeLaneIdx.value = 0;
    state.modalEntityId.value = null;
    state.pendingMergeChoice.value = null;
    state.dragTileId.value = null;
    state.dropTargetId.value = null;
  },
};

export function isSliderBased(ent: Entity): boolean {
  return ent.type === 'slider_light' || ent.type === 'rich_ac_row' || ent.type === 'stateful_tv';
}

export function isSimpleEntity(ent: Entity): boolean {
  if (ent.nestedTiles.length > 0) return false;
  if (ent.type === 'slider_light') return (ent.secondaryButtons ?? []).length === 0;
  return ['scene_pill', 'simple_thermostat', 'closure_lock_tile', 'matter_smoke_alarm', 'sensor_graph'].includes(
    ent.type,
  );
}

function minRowsFor(type: Entity['type']): number {
  return type === 'vertical_blind' ? 3 : 1;
}

function executeRuleAGroupTogether(targetId: string, sourceId: string) {
  const target = state.entities[targetId];
  const source = state.entities[sourceId];
  if (!target || !source) return;
  target.span = {
    c: Math.max(2, target.span.c),
    r: Math.max(target.span.r, minRowsFor(target.type)),
  };
  const on = Boolean(target.on ?? target.active) || Boolean(source.on ?? source.active);
  const brightness = Math.round(((target.brightness ?? 50) + (source.brightness ?? 50)) / 2);
  if (target.type === 'slider_light' || target.type === 'simple_thermostat') {
    target.on = on;
    target.brightness = brightness;
  }
  target.title = `${target.title} + ${source.title}`;
  const srcMain = (source.mainButtons ?? []).filter((b) => !(target.mainButtons ?? []).some((t) => t.id === b.id));
  if (srcMain.length > 0) target.mainButtons = [...(target.mainButtons ?? []), ...srcMain].slice(0, 4);
  target.expanders = { ...target.expanders, down: true, right: true };
  store.removeEntity(sourceId);
  store.toast(`Zgrupowano: ${target.title} (Rule A — Group Together)`);
}

function executeRuleAAddAsSecondaryButton(targetId: string, sourceId: string) {
  const target = state.entities[targetId];
  const source = state.entities[sourceId];
  if (!target || !source) return;
  target.span = { c: Math.max(2, target.span.c), r: Math.max(2, target.span.r) };
  target.expanders = { down: true, right: true, diagonal: target.expanders.diagonal };
  target.expandedContent = { ...target.expandedContent, secondaryButtons: true };
  target.secondaryButtons = [
    ...(target.secondaryButtons ?? []),
    {
      id: `sec_${source.id}`,
      label: source.title,
      icon: source.iconType === 'mdi' ? source.icon ?? 'table-lamp' : 'table-lamp',
      iconType: 'mdi',
      active: Boolean(source.on ?? source.active),
      brightness: source.brightness ?? 60,
      type: 'oval_pill',
    },
  ];
  store.removeEntity(sourceId);
  store.toast(`Dodano "${source.title}" jako przycisk dodatkowy`);
}

function executeRuleBNest(targetId: string, sourceId: string) {
  const target = state.entities[targetId];
  const source = state.entities[sourceId];
  if (!target || !source) return;
  if (!target.nestedTiles.includes(sourceId)) target.nestedTiles.push(sourceId);
  target.expanders = { down: true, right: true, diagonal: target.expanders.diagonal };
  store.removeEntity(sourceId);
  store.toast(`Zagnieżdżono "${source.title}" w "${target.title}" (Rule B)`);
}

function executeRuleCSensorMerge(targetId: string, sourceId: string) {
  const target = state.entities[targetId];
  const source = state.entities[sourceId];
  if (!target || !source) return;
  const existing = new Set((target.series ?? []).map((s) => s.id));
  const incoming = (source.series ?? []).filter((s) => !existing.has(s.id));
  target.series = [...(target.series ?? []), ...(incoming as Series[])];
  target.title = `${target.title.replace(' 24h', '')} + ${source.title.replace(' 24h', '')}`;
  target.span = { c: Math.max(3, target.span.c), r: Math.max(3, target.span.r) };
  target.defaultSpan = { c: 3, r: 3 };
  target.expanders = { ...target.expanders, diagonal: true };
  store.removeEntity(sourceId);
  store.toast(`Połączono serie sensorów na wykresie ${target.title} (Rule C)`);
}

export function useHomeStore(): HomeStore {
  return store;
}
