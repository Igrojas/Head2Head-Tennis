import { useMemo } from 'react'
import type { StyledEdge, StyledNode } from './types'

interface PlayerDetailPanelProps {
  node: StyledNode
  edges: StyledEdge[]
  onClose: () => void
  onOpenProfile: (name: string) => void
  onFocusRival: (name: string) => void
}

export function PlayerDetailPanel({ node, edges, onClose, onOpenProfile, onFocusRival }: PlayerDetailPanelProps) {
  const rivals = useMemo(() => {
    return edges
      .filter((e) => e.source === node.id || e.target === node.id)
      .map((e) => {
        const rivalId = e.source === node.id ? e.target : e.source
        const wins = e.source === node.id ? e.winsSource : e.winsTarget
        return { id: rivalId, wins, losses: e.totalMatches - wins, total: e.totalMatches }
      })
      .sort((a, b) => b.total - a.total)
  }, [edges, node.id])

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-l border-ink-800 bg-ink-900/95 sm:w-80">
      <div className="flex items-start justify-between gap-2 border-b border-ink-800 p-4">
        <div>
          <p className="font-display text-lg font-semibold text-paper">{node.label}</p>
          <p className="mt-1 text-xs text-ink-300">
            {node.wins} victorias · {node.totalMatches} partidos · {node.winRate.toFixed(1)}% rendimiento
          </p>
          <p className="mt-0.5 text-xs text-ink-300">Centralidad en el grafo: {(node.centrality * 100).toFixed(0)}%</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-ink-300 hover:bg-ink-800 hover:text-paper"
        >
          ✕
        </button>
      </div>

      <button
        type="button"
        onClick={() => onOpenProfile(node.id)}
        className="m-4 rounded-lg border border-clay-400/50 bg-clay-400/10 px-3 py-2 text-xs font-medium text-clay-300 transition-colors hover:bg-clay-400/15"
      >
        Ver perfil completo en Head-to-Head ↓
      </button>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-300">
          Rivales en este grafo ({rivals.length})
        </p>
        <ul className="space-y-1.5">
          {rivals.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onFocusRival(r.id)}
                className="flex w-full items-center justify-between rounded-lg border border-ink-800 bg-ink-900/60 px-3 py-2 text-left text-xs transition-colors hover:border-ink-600"
              >
                <span className="text-ink-100">{r.id}</span>
                <span className="whitespace-nowrap text-ink-300">
                  {r.wins}-{r.losses}{' '}
                  <span className={r.wins >= r.losses ? 'text-clay-300' : 'text-plum-300'}>
                    ({node.wins ? Math.round((r.wins / r.total) * 100) : 0}%)
                  </span>
                </span>
              </button>
            </li>
          ))}
          {rivals.length === 0 && (
            <li className="rounded-lg border border-dashed border-ink-700 px-3 py-4 text-center text-ink-300">
              Sin enfrentamientos dentro del filtro actual.
            </li>
          )}
        </ul>
      </div>
    </aside>
  )
}
