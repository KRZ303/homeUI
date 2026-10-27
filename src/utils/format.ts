export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function toPL(value: number | string, digits = 0): string {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numeric)) return String(value)
  if (digits > 0 || !Number.isInteger(numeric)) {
    return numeric.toFixed(digits || 2).replace('.', ',')
  }
  return String(numeric)
}

export function fixedPL(value: number, digits = 1): string {
  return value.toFixed(digits).replace('.', ',')
}

export function spanLabel(c: number, r: number): string {
  return `${c}×${r}`
}
