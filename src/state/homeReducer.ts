import type { Device, HomeAction, HomeState } from '../types';

function updateDevice(state: HomeState, deviceId: string, update: Partial<Device>): HomeState {
  return {
    ...state,
    devices: {
      ...state.devices,
      [deviceId]: { ...state.devices[deviceId], ...update },
    },
  };
}

export function homeReducer(state: HomeState, action: HomeAction): HomeState {
  switch (action.type) {
    case 'toggle-device': {
      const device = state.devices[action.deviceId];
      if (device.kind === 'climate') {
        const nextMode = device.mode === 'off' ? device.modes?.find((mode) => mode !== 'off') ?? 'auto' : 'off';
        return updateDevice(state, device.id, { mode: nextMode, active: nextMode !== 'off' });
      }
      return updateDevice(state, device.id, { active: !device.active });
    }
    case 'set-brightness':
      return updateDevice(state, action.deviceId, { brightness: action.value, active: action.value > 0 });
    case 'set-target':
      return updateDevice(state, action.deviceId, { targetTemperature: action.value });
    case 'set-mode':
      return updateDevice(state, action.deviceId, { mode: action.mode, active: action.mode !== 'off' });
    case 'toggle-playback':
      return updateDevice(state, action.deviceId, { playing: !state.devices[action.deviceId].playing });
    case 'set-volume':
      return updateDevice(state, action.deviceId, { volume: action.value });
    case 'change-track': {
      const device = state.devices[action.deviceId];
      const count = device.tracks?.length ?? 0;
      if (!count) return state;
      const track = ((device.track ?? 0) + action.delta + count) % count;
      return updateDevice(state, device.id, { track });
    }
    case 'toggle-expanded': {
      const expanded = !state.devices[action.deviceId].expanded;
      return updateDevice(state, action.deviceId, { expanded });
    }
    case 'set-expanded':
      return updateDevice(state, action.deviceId, { expanded: action.value });
    case 'set-program':
      return updateDevice(state, action.deviceId, { program: action.program });
    case 'toggle-option': {
      const device = state.devices[action.deviceId];
      const selected = device.selectedOptions ?? [];
      const selectedOptions = selected.includes(action.option)
        ? selected.filter((option) => option !== action.option)
        : [...selected, action.option];
      return updateDevice(state, device.id, { selectedOptions });
    }
    case 'start-dishwasher': {
      const device = state.devices[action.deviceId];
      if (device.running) {
        return updateDevice(state, device.id, { running: false, active: false });
      }
      return updateDevice(state, device.id, { running: true, active: true, progress: 1 });
    }
    case 'tick-dishwashers': {
      const devices = Object.fromEntries(
        Object.entries(state.devices).map(([id, device]) => {
          if (!device.running) return [id, device];
          const progress = Math.min((device.progress ?? 0) + 1, 100);
          return [id, { ...device, progress, running: progress < 100, active: progress < 100 }];
        }),
      );
      return { ...state, devices };
    }
    case 'group-device': {
      const source = state.devices[action.sourceId];
      const target = state.devices[action.targetId];
      if (!source || !target || source.id === target.id || source.kind !== 'light' || !target.acceptsChildren) return state;
      if (target.children?.includes(source.id) || target.groupedInto) return state;
      const rooms = state.rooms.map((room) => ({
        ...room,
        deviceIds: room.deviceIds.filter((id) => id !== source.id),
      }));
      return {
        rooms,
        devices: {
          ...state.devices,
          [source.id]: { ...source, groupedInto: target.id, expanded: false },
          [target.id]: { ...target, children: [...(target.children ?? []), source.id] },
        },
      };
    }
    case 'ungroup-device': {
      const device = state.devices[action.deviceId];
      if (!device?.groupedInto) return state;
      const parent = state.devices[device.groupedInto];
      const rooms = state.rooms.map((room) => room.id === device.roomId
        ? { ...room, deviceIds: [...room.deviceIds, device.id] }
        : room);
      return {
        rooms,
        devices: {
          ...state.devices,
          [device.id]: { ...device, groupedInto: undefined },
          [parent.id]: { ...parent, children: parent.children?.filter((id) => id !== device.id) },
        },
      };
    }
  }
}
