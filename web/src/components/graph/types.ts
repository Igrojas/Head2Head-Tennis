export type LayoutName = 'fcose' | 'concentric' | 'circle' | 'grid'

export interface StyledNode {
  id: string
  label: string
  /** Texto mostrado junto al nodo en el canvas; vacío cuando hay demasiados nodos para evitar amontonamiento. */
  nodeLabel: string
  size: number
  color: string
  wins: number
  totalMatches: number
  winRate: number
  centrality: number
  /** Top 5 por centralidad dentro del recorte filtrado actual: recibe el anillo distintivo de "hub". */
  isHub: boolean
}

export interface StyledEdge {
  id: string
  source: string
  target: string
  width: number
  totalMatches: number
  winsSource: number
  winsTarget: number
  /** 0..1, qué tan intensa es esta rivalidad respecto al máximo de enfrentamientos del recorte actual. */
  intensity: number
  color: string
}

export const LAYOUT_LABELS: Record<LayoutName, string> = {
  fcose: 'Orgánico (por rivalidad)',
  concentric: 'Concéntrico (por victorias)',
  circle: 'Circular',
  grid: 'Grilla',
}
