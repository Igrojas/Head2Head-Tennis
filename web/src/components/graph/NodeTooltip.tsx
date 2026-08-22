import { createPortal } from 'react-dom'
import type { StyledNode } from './types'

export function NodeTooltip({ node, x, y }: { node: StyledNode; x: number; y: number }) {
  return createPortal(
    <div
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-xs shadow-xl shadow-black/50"
      style={{ left: x, top: y }}
    >
      <p className="flex items-center gap-1.5 font-display font-medium text-paper">
        {node.isHub && (
          <span className="grid h-4 w-4 place-items-center rounded-full bg-ace-400/20 text-[10px] text-ace-400">
            ★
          </span>
        )}
        {node.label}
      </p>
      <p className="mt-1 text-ink-200">
        {node.wins} victorias · {node.totalMatches} partidos · {node.winRate.toFixed(1)}% rendimiento
      </p>
      <p className="flex items-center gap-1.5 text-ink-300">
        <span className="h-2 w-2 rounded-full" style={{ background: node.color }} />
        Centralidad: {(node.centrality * 100).toFixed(0)}%{node.isHub ? ' · hub de la red' : ''}
      </p>
    </div>,
    document.body,
  )
}
