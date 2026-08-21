export interface PlayerSummary {
  name: string
  slug: string
  wins: number
  totalMatches: number
  winRate: number
}

export interface H2HRow {
  rival: string
  wins: number
  losses: number
  total: number
}

export interface PerformanceRow {
  year: number
  wins: number
  losses: number
  total: number
  rendimiento: number
}

export interface NetworkNode {
  id: string
  slug: string
  wins: number
  totalMatches: number
  winRate: number
}

export interface NetworkEdge {
  source: string
  target: string
  totalMatches: number
  winsSource: number
  winsTarget: number
}

export interface NetworkData {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  minWins: number
}
