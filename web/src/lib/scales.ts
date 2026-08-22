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

// Escala de "centralidad": ciruela (Wimbledon, poco conectado) -> arcilla
// (Roland Garros, conectado) -> amarillo-pelota (US Open, hub de la red).
// El amarillo queda en el extremo superior: solo lo llevan los jugadores más
// conectados, así el "foco" de la paleta señala justo lo más importante.
const CENTRALITY_STOPS = ['#5b2a86', '#c2572a', '#d7ff5f']

export function centralityColor(t: number): string {
  const clamped = clamp(t, 0, 1)
  if (clamped <= 0.5) return rgbToHex(lerpColor(CENTRALITY_STOPS[0], CENTRALITY_STOPS[1], clamped / 0.5))
  return rgbToHex(lerpColor(CENTRALITY_STOPS[1], CENTRALITY_STOPS[2], (clamped - 0.5) / 0.5))
}

// Escala de "intensidad de rivalidad" para aristas: gris-verdoso apagado
// (pocos cruces) -> arcilla brillante (rivalidad histórica, muchos cruces).
// A diferencia de centralityColor, esta no toca el amarillo: así una arista
// nunca compite visualmente con el amarillo reservado para selección/hubs.
const EDGE_STOPS = ['#3a5245', '#c2572a']

export function edgeIntensityColor(t: number): string {
  return rgbToHex(lerpColor(EDGE_STOPS[0], EDGE_STOPS[1], clamp(t, 0, 1)))
}
