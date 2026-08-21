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
}

export interface StyledEdge {
  id: string
  source: string
  target: string
  width: number
  totalMatches: number
  winsSource: number
  winsTarget: number
}

export const LAYOUT_LABELS: Record<LayoutName, string> = {
  fcose: 'Orgánico (por rivalidad)',
  concentric: 'Concéntrico (por victorias)',
  circle: 'Circular',
  grid: 'Grilla',
}
