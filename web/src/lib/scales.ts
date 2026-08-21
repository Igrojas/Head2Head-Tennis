export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

/** Interpola linealmente `v` de [inMin, inMax] a [outMin, outMax], con clamp. */
export function linScale(v: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax <= inMin) return outMin
  const t = clamp((v - inMin) / (inMax - inMin), 0, 1)
  return outMin + t * (outMax - outMin)
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0')).join('')}`
}

function lerpColor(a: string, b: string, t: number): [number, number, number] {
  const [ar, ag, ab] = hexToRgb(a)
  const [br, bg, bb] = hexToRgb(b)
  return [ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]
}

// Escala de "centralidad": frío (poco conectado) -> cálido (hub de rivalidades).
const STOPS = ['#33475a', '#c96a3e', '#ffd166']

export function centralityColor(t: number): string {
  const clamped = clamp(t, 0, 1)
  if (clamped <= 0.5) return rgbToHex(lerpColor(STOPS[0], STOPS[1], clamped / 0.5))
  return rgbToHex(lerpColor(STOPS[1], STOPS[2], (clamped - 0.5) / 0.5))
}
