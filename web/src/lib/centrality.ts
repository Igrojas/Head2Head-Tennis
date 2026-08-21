import type { NetworkEdge, NetworkNode } from '../types'

/**
 * Centralidad de grado normalizada (0..1): proporción de rivales-hub con los
 * que se enfrentó cada jugador, respecto al máximo posible en el subconjunto
 * filtrado actual. Se recalcula en el cliente cada vez que cambian los
 * filtros para que siga siendo correcta al manipular el grafo.
 */
export function degreeCentrality(nodes: NetworkNode[], edges: NetworkEdge[]): Map<string, number> {
  const neighbors = new Map<string, Set<string>>()
  nodes.forEach((n) => neighbors.set(n.id, new Set()))
  edges.forEach((e) => {
    neighbors.get(e.source)?.add(e.target)
    neighbors.get(e.target)?.add(e.source)
  })
  const denom = Math.max(1, nodes.length - 1)
  const result = new Map<string, number>()
  neighbors.forEach((set, id) => result.set(id, set.size / denom))
  return result
}
