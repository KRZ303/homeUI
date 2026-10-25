import { initialHomeState } from '../data/home';
import { homeReducer } from './homeReducer';

describe('homeReducer', () => {
  it('turns climate off and restores a functional mode', () => {
    const off = homeReducer(initialHomeState, { type: 'toggle-device', deviceId: 'living-climate' });
    expect(off.devices['living-climate'].mode).toBe('off');
    expect(off.devices['living-climate'].active).toBe(false);
    const on = homeReducer(off, { type: 'toggle-device', deviceId: 'living-climate' });
    expect(on.devices['living-climate'].mode).toBe('heat');
  });

  it('turns a light off when brightness reaches zero', () => {
    const state = homeReducer(initialHomeState, { type: 'set-brightness', deviceId: 'living-lights', value: 0 });
    expect(state.devices['living-lights'].active).toBe(false);
    expect(state.devices['living-lights'].brightness).toBe(0);
  });

  it('starts and advances a dishwasher cycle', () => {
    const running = homeReducer(initialHomeState, { type: 'start-dishwasher', deviceId: 'dishwasher' });
    expect(running.devices.dishwasher).toMatchObject({ running: true, active: true, progress: 1 });
    const advanced = homeReducer(running, { type: 'tick-dishwashers' });
    expect(advanced.devices.dishwasher.progress).toBe(2);
  });

  it('completes a dishwasher cycle at 100 percent', () => {
    const running = homeReducer(initialHomeState, { type: 'start-dishwasher', deviceId: 'dishwasher' });
    const nearlyDone = {
      ...running,
      devices: { ...running.devices, dishwasher: { ...running.devices.dishwasher, progress: 99 } },
    };
    const complete = homeReducer(nearlyDone, { type: 'tick-dishwashers' });
    expect(complete.devices.dishwasher).toMatchObject({ running: false, active: false, progress: 100 });
  });

  it('moves a simple light into a compatible group', () => {
    const state = homeReducer(initialHomeState, { type: 'group-device', sourceId: 'reading-light', targetId: 'living-lights' });
    expect(state.devices['living-lights'].children).toContain('reading-light');
    expect(state.devices['reading-light'].groupedInto).toBe('living-lights');
    expect(state.rooms[0].deviceIds).not.toContain('reading-light');
  });

  it('rejects incompatible composition', () => {
    const state = homeReducer(initialHomeState, { type: 'group-device', sourceId: 'living-tv', targetId: 'living-lights' });
    expect(state).toBe(initialHomeState);
  });

  it('returns a grouped light to its room', () => {
    const grouped = homeReducer(initialHomeState, { type: 'group-device', sourceId: 'reading-light', targetId: 'living-lights' });
    const state = homeReducer(grouped, { type: 'ungroup-device', deviceId: 'reading-light' });
    expect(state.devices['living-lights'].children).not.toContain('reading-light');
    expect(state.devices['reading-light'].groupedInto).toBeUndefined();
    expect(state.rooms[0].deviceIds).toContain('reading-light');
  });

  it('expands a widget without changing its base footprint', () => {
    const state = homeReducer(initialHomeState, { type: 'toggle-expanded', deviceId: 'living-tv' });
    expect(state.devices['living-tv'].expanded).toBe(true);
    expect(state.devices['living-tv'].footprint).toEqual({ columns: 2, rows: 1 });
  });
});
