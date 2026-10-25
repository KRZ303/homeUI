import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Fan, Flame, GripVertical, Maximize2, Minimize2, Minus, Pause, Play, Plus, Power, SkipBack, SkipForward, Snowflake, Sparkles, Wind } from 'lucide-react';
import { motion } from 'motion/react';
import type { CSSProperties, Dispatch, ReactNode } from 'react';
import type { Device, HomeAction } from '../types';
import { getDeviceStatus } from '../types';
import { ControlButton, RangeControl } from './controls';
import { DeviceIcon } from './DeviceIcon';

interface WidgetProps {
  device: Device;
  devices: Record<string, Device>;
  dispatch: Dispatch<HomeAction>;
  onOpen: (deviceId: string) => void;
  arrange: boolean;
}

function expandedFootprint(device: Device) {
  if (!device.expanded) return device.footprint;
  return { columns: Math.max(device.footprint.columns, 2), rows: device.footprint.rows + 1 };
}

function ModeGlyph({ mode }: { mode: string }) {
  if (mode === 'heat') return <Flame size={17} />;
  if (mode === 'cool') return <Snowflake size={17} />;
  if (mode === 'fan') return <Fan size={17} />;
  if (mode === 'auto') return <Sparkles size={17} />;
  if (mode === 'off') return <Power size={17} />;
  return <Wind size={17} />;
}

function primaryLabel(device: Device) {
  if (device.kind === 'sensor') return `Open ${device.name} details`;
  if (device.kind === 'scene') return `${device.active ? 'Deactivate' : 'Activate'} ${device.name}`;
  return `${device.active ? 'Turn off' : 'Turn on'} ${device.name}`;
}

export function Widget({ device, devices, dispatch, onOpen, arrange }: WidgetProps) {
  const footprint = expandedFootprint(device);
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: device.id,
    disabled: !arrange || device.kind !== 'light' || device.acceptsChildren,
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: device.id,
    disabled: !arrange || !device.acceptsChildren,
  });
  const showControls = device.expanded || device.footprint.columns > 1 || device.footprint.rows > 1;
  const isActive = device.kind === 'climate' ? device.mode !== 'off' : device.active;
  const status = device.kind === 'light' && device.footprint.columns === 1 && device.active
    ? `${device.brightness ?? 100}%`
    : getDeviceStatus(device);
  const style = {
    '--column-span': footprint.columns,
    '--row-span': footprint.rows,
  } as CSSProperties;

  let controls: ReactNode = null;
  if (device.kind === 'light' && showControls) {
    controls = (
      <>
        <RangeControl label={`${device.name} brightness`} value={device.brightness ?? 0} onChange={(value) => dispatch({ type: 'set-brightness', deviceId: device.id, value })} />
        {device.expanded && (
          <div className="widget__secondary">
            <span>{device.detail}</span>
            {!!device.children?.length && (
              <div className="nested-devices" aria-label="Grouped lights">
                {device.children.map((id) => {
                  const child = devices[id];
                  return (
                    <div key={id} className={`nested-device widget-interactive ${child.active ? 'is-active' : ''}`}>
                      <button type="button" className="nested-device__action" aria-label={`${child.active ? 'Turn off' : 'Turn on'} ${child.name}`} onClick={() => dispatch({ type: 'toggle-device', deviceId: id })}><LightbulbIcon active={child.active} /></button>
                      <button type="button" className="nested-device__name" onClick={() => onOpen(id)}>{child.name}</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </>
    );
  }

  if (device.kind === 'climate') {
    controls = (
      <>
        <div className="temperature-control widget-interactive">
          <ControlButton label={`Lower ${device.name} target`} onClick={() => dispatch({ type: 'set-target', deviceId: device.id, value: (device.targetTemperature ?? 20) - 0.5 })}><Minus size={18} /></ControlButton>
          <output aria-label={`${device.name} target temperature`}>{device.targetTemperature}<small>°</small></output>
          <ControlButton label={`Raise ${device.name} target`} onClick={() => dispatch({ type: 'set-target', deviceId: device.id, value: (device.targetTemperature ?? 20) + 0.5 })}><Plus size={18} /></ControlButton>
        </div>
        {(device.expanded || device.footprint.rows > 1) && (
          <div className="mode-control" aria-label={`${device.name} mode`}>
            {device.modes?.map((mode) => (
              <ControlButton key={mode} label={`${device.name} ${mode} mode`} active={device.mode === mode} onClick={() => dispatch({ type: 'set-mode', deviceId: device.id, mode })}><ModeGlyph mode={mode} /><span>{mode}</span></ControlButton>
            ))}
          </div>
        )}
      </>
    );
  }

  if (device.kind === 'media') {
    controls = device.active && (
      <>
        <div className="media-controls widget-interactive">
          {(device.expanded || device.footprint.rows > 1) && <ControlButton label={`Previous ${device.name} track`} onClick={() => dispatch({ type: 'change-track', deviceId: device.id, delta: -1 })}><SkipBack size={18} /></ControlButton>}
          <ControlButton className="media-controls__play" label={`${device.playing ? 'Pause' : 'Play'} ${device.name}`} onClick={() => dispatch({ type: 'toggle-playback', deviceId: device.id })}>{device.playing ? <Pause size={18} /> : <Play size={18} />}</ControlButton>
          {(device.expanded || device.footprint.rows > 1) && <ControlButton label={`Next ${device.name} track`} onClick={() => dispatch({ type: 'change-track', deviceId: device.id, delta: 1 })}><SkipForward size={18} /></ControlButton>}
        </div>
        {device.expanded && <RangeControl label="Television volume" value={device.volume ?? 0} onChange={(value) => dispatch({ type: 'set-volume', deviceId: device.id, value })} />}
      </>
    );
  }

  if (device.kind === 'dishwasher') {
    controls = device.running ? (
      <div className="cycle-progress">
        <div><span>{device.program}</span><strong>{device.progress}%</strong></div>
        <progress aria-label="Dishwasher cycle progress" max={100} value={device.progress} />
        <ControlButton label="Stop dishwasher" onClick={() => dispatch({ type: 'start-dishwasher', deviceId: device.id })}>Stop cycle</ControlButton>
      </div>
    ) : (
      <div className="appliance-controls widget-interactive">
        <select aria-label="Dishwasher program" value={device.program} onChange={(event) => dispatch({ type: 'set-program', deviceId: device.id, program: event.target.value })} onClick={(event) => event.stopPropagation()}>
          {device.programs?.map((program) => <option key={program}>{program}</option>)}
        </select>
        {(device.expanded || device.footprint.columns >= 4) && device.options?.map((option) => (
          <ControlButton key={option} label={option} active={device.selectedOptions?.includes(option)} onClick={() => dispatch({ type: 'toggle-option', deviceId: device.id, option })}>{option}</ControlButton>
        ))}
        <ControlButton className="start-button" label="Start dishwasher" onClick={() => dispatch({ type: 'start-dishwasher', deviceId: device.id })}>Start</ControlButton>
      </div>
    );
  }

  return (
    <motion.article
      layout
      ref={(node) => { setDragRef(node); setDropRef(node); }}
      style={style}
      className={`widget widget--${device.kind} ${device.footprint.columns > 1 ? 'widget--wide' : ''} ${device.footprint.rows === 1 ? 'widget--short' : ''} ${isActive ? 'is-active' : ''} ${device.expanded ? 'is-expanded' : ''} ${isOver ? 'is-drop-target' : ''}`}
      animate={{ opacity: isDragging ? 0.3 : 1, scale: isDragging ? 0.98 : 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      data-testid={`device-${device.id}`}
      aria-label={`${device.name}, ${status}`}
    >
      <button type="button" className="widget-hit-area" aria-label={`Open ${device.name} details`} onClick={() => onOpen(device.id)} />
      <div className="widget__topline">
        <ControlButton label={primaryLabel(device)} className="device-action" active={isActive} onClick={() => device.kind === 'sensor' ? onOpen(device.id) : dispatch({ type: 'toggle-device', deviceId: device.id })}>
          <DeviceIcon device={device} />
        </ControlButton>
        {arrange && device.kind === 'light' && !device.acceptsChildren && (
          <button type="button" className="drag-handle widget-interactive" aria-label={`Move ${device.name}`} {...listeners} {...attributes}><GripVertical size={18} /></button>
        )}
        {!arrange && device.canExpand && (
          <ControlButton label={`${device.expanded ? 'Collapse' : 'Expand'} ${device.name}`} className="expand-action" onClick={() => dispatch({ type: 'toggle-expanded', deviceId: device.id })}>
            {device.expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </ControlButton>
        )}
      </div>
      <div className="widget__identity">
        <h2>{device.name}</h2>
        <p>{status}</p>
      </div>
      {controls && <div className="widget__controls">{controls}</div>}
    </motion.article>
  );
}

function LightbulbIcon({ active }: { active: boolean }) {
  return <span className={`nested-device__dot ${active ? 'is-on' : ''}`} aria-hidden="true" />;
}
