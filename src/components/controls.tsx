import { useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface RangeControlProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function RangeControl({ label, value, min = 0, max = 100, unit = '%', onChange }: RangeControlProps) {
  const id = useId();
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <div className="range-control widget-interactive">
      <label htmlFor={id}>{label}<span>{value}{unit}</span></label>
      <input
        id={id}
        aria-label={label}
        type="range"
        min={min}
        max={max}
        value={value}
        style={{ '--range-progress': `${progress}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

interface ControlButtonProps {
  label: string;
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  className?: string;
}

export function ControlButton({ label, children, onClick, active = false, className = '' }: ControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active || undefined}
      className={`control-button widget-interactive ${active ? 'is-selected' : ''} ${className}`}
      onClick={(event) => { event.stopPropagation(); onClick(); }}
    >
      {children}
    </button>
  );
}
