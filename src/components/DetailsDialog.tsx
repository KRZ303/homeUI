import { Maximize2, Minus, Plus, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Dispatch } from 'react';
import type { Device, HomeAction } from '../types';
import { getDeviceStatus } from '../types';
import { ControlButton, RangeControl } from './controls';
import { DeviceIcon } from './DeviceIcon';

interface DetailsDialogProps {
  device?: Device;
  dispatch: Dispatch<HomeAction>;
  onClose: () => void;
}

export function DetailsDialog({ device, dispatch, onClose }: DetailsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (device && !dialog.open) dialog.showModal();
    if (!device && dialog.open) dialog.close();
  }, [device]);

  if (!device) return null;

  return (
    <dialog
      ref={ref}
      className="details-dialog"
      aria-labelledby="details-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="details-dialog__surface">
        <div className="details-dialog__topline">
          <span className={`details-dialog__icon ${device.active ? 'is-active' : ''}`}><DeviceIcon device={device} size={25} /></span>
          <ControlButton label="Close details" onClick={onClose}><X size={20} /></ControlButton>
        </div>
        <h2 id="details-title">{device.name}</h2>
        <p className="details-dialog__status">{getDeviceStatus(device)}</p>
        <p className="details-dialog__description">{device.detail}</p>

        <div className="details-dialog__controls">
          {device.kind === 'light' && <RangeControl label="Brightness" value={device.brightness ?? 0} onChange={(value) => dispatch({ type: 'set-brightness', deviceId: device.id, value })} />}
          {device.kind === 'climate' && (
            <div className="temperature-control">
              <ControlButton label="Lower target temperature" onClick={() => dispatch({ type: 'set-target', deviceId: device.id, value: (device.targetTemperature ?? 20) - 0.5 })}><Minus size={20} /></ControlButton>
              <output aria-label="Target temperature">{device.targetTemperature}°</output>
              <ControlButton label="Raise target temperature" onClick={() => dispatch({ type: 'set-target', deviceId: device.id, value: (device.targetTemperature ?? 20) + 0.5 })}><Plus size={20} /></ControlButton>
            </div>
          )}
          {device.kind === 'media' && <RangeControl label="Volume" value={device.volume ?? 0} onChange={(value) => dispatch({ type: 'set-volume', deviceId: device.id, value })} />}
          {device.kind === 'dishwasher' && (
            <label className="details-select">Program
              <select value={device.program} disabled={device.running} onChange={(event) => dispatch({ type: 'set-program', deviceId: device.id, program: event.target.value })}>
                {device.programs?.map((program) => <option key={program}>{program}</option>)}
              </select>
            </label>
          )}
        </div>

        <div className="details-dialog__settings">
          {device.canExpand && (
            <label className="setting-row">
              <span><Maximize2 size={18} />Expanded view</span>
              <input type="checkbox" checked={device.expanded ?? false} onChange={(event) => dispatch({ type: 'set-expanded', deviceId: device.id, value: event.target.checked })} />
            </label>
          )}
          {device.groupedInto && (
            <button type="button" className="text-button" onClick={() => { dispatch({ type: 'ungroup-device', deviceId: device.id }); onClose(); }}>Remove from group</button>
          )}
        </div>
      </div>
    </dialog>
  );
}
