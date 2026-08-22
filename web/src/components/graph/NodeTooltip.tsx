import { createPortal } from 'react-dom'
import type { StyledNode } from './types'

export function NodeTooltip({ node, x, y }: { node: StyledNode; x: number; y: number }) {
  return createPortal(
    <div
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-lg border border-court-700 bg-court-850 px-3 py-2 text-xs shadow-xl shadow-black/50"
      style={{ left: x, top: y }}
    >
      <p className="font-medium text-white">{node.label}</p>
      <p className="mt-1 text-court-200">
        {node.wins} victorias · {node.totalMatches} partidos · {node.winRate.toFixed(1)}% rendimiento
      </p>
      <p className="text-court-300">Centralidad: {(node.centrality * 100).toFixed(0)}%</p>
    </div>,
    document.body,
  )
}
