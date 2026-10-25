import { Coffee, Droplets, Gauge, Lightbulb, MoonStar, Sparkles, Thermometer, Tv, Wind } from 'lucide-react';
import type { Device } from '../types';

interface DeviceIconProps {
  device: Device;
  size?: number;
}

export function DeviceIcon({ device, size = 21 }: DeviceIconProps) {
  const props = { size, strokeWidth: 1.8, 'aria-hidden': true as const };
  switch (device.kind) {
    case 'light': return <Lightbulb {...props} />;
    case 'climate': return <Thermometer {...props} />;
    case 'media': return <Tv {...props} />;
    case 'dishwasher': return <Droplets {...props} />;
    case 'sensor': return device.name.includes('Air') || device.name.includes('CO₂') ? <Wind {...props} /> : <Gauge {...props} />;
    case 'scene':
      if (device.name === 'Coffee') return <Coffee {...props} />;
      if (device.name === 'Focus') return <Sparkles {...props} />;
      return <MoonStar {...props} />;
  }
}
