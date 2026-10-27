export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function decimalComma(value: number, digits = 1): string {
  return value.toFixed(digits).replace('.', ',')
}
