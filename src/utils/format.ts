export function fmtTemp(value: number | undefined, digits = 1): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return value.toFixed(digits).replace('.', ',');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function uid(seed: string): string {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${seed}-${rnd}`;
}
