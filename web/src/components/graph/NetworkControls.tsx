import type { ReactNode } from 'react'
import { PlayerCombobox } from '../common/PlayerCombobox'
import type { PlayerSummary } from '../../types'
import { LAYOUT_LABELS, type LayoutName } from './types'

interface NetworkControlsProps {
  minWins: number
  minWinsBounds: [number, number]
  onMinWinsChange: (v: number) => void
  minEdgeMatches: number
  edgeMatchesBounds: [number, number]
  onMinEdgeMatchesChange: (v: number) => void
  layoutName: LayoutName
  onLayoutChange: (l: LayoutName) => void
  nodeCount: number
  edgeCount: number
  searchPlayers: PlayerSummary[]
  onSearchSelect: (name: string) => void
  onFit: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  expanded: boolean
  onToggleExpanded: () => void
}

export function NetworkControls({
  minWins,
  minWinsBounds,
  onMinWinsChange,
  minEdgeMatches,
  edgeMatchesBounds,
  onMinEdgeMatchesChange,
  layoutName,
  onLayoutChange,
  nodeCount,
  edgeCount,
  searchPlayers,
  onSearchSelect,
  onFit,
  onZoomIn,
  onZoomOut,
  onReset,
  expanded,
  onToggleExpanded,
}: NetworkControlsProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink-800 bg-ink-900/70 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:flex-wrap">
        <div className="min-w-[220px]">
          <label className="mb-1 block text-xs font-medium text-ink-300">
            Buscar y saltar a un jugador
          </label>
          <PlayerCombobox players={searchPlayers} value={null} onChange={onSearchSelect} placeholder="Ej: Rafael Nadal" />
        </div>

        <div className="min-w-[220px] flex-1 max-w-xs">
          <label className="mb-1 flex justify-between text-xs font-medium text-ink-300">
            <span>Mínimo de victorias</span>
            <span className="text-paper">{minWins}</span>
          </label>
          <input
            type="range"
            min={minWinsBounds[0]}
            max={minWinsBounds[1]}
            value={minWins}
            onChange={(e) => onMinWinsChange(Number(e.target.value))}
            className="w-full accent-clay-400"
          />
        </div>

        <div className="min-w-[220px] flex-1 max-w-xs">
          <label className="mb-1 flex justify-between text-xs font-medium text-ink-300">
            <span>Mínimo de enfrentamientos por arista</span>
            <span className="text-paper">{minEdgeMatches}</span>
          </label>
          <input
            type="range"
            min={edgeMatchesBounds[0]}
            max={edgeMatchesBounds[1]}
            value={minEdgeMatches}
            onChange={(e) => onMinEdgeMatchesChange(Number(e.target.value))}
            className="w-full accent-plum-400"
          />
        </div>

        <div className="min-w-[180px]">
          <label className="mb-1 block text-xs font-medium text-ink-300">Layout</label>
          <select
            value={layoutName}
            onChange={(e) => onLayoutChange(e.target.value as LayoutName)}
            className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-paper outline-none focus:border-clay-400/60"
          >
            {Object.entries(LAYOUT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-end gap-4">
        <p className="whitespace-nowrap text-xs text-ink-300">
          <span className="text-paper">{nodeCount}</span> jugadores ·{' '}
          <span className="text-paper">{edgeCount}</span> enfrentamientos
          {nodeCount > 60 && <span className="block text-ink-300/70">Etiquetas ocultas: usa la búsqueda o el hover</span>}
        </p>
        <div className="flex gap-1.5">
          <IconButton onClick={onZoomIn} title="Acercar">
            +
          </IconButton>
          <IconButton onClick={onZoomOut} title="Alejar">
            −
          </IconButton>
          <IconButton onClick={onFit} title="Ajustar a la vista">
            ⤢
          </IconButton>
          <IconButton onClick={onReset} title="Restablecer filtros">
            ↺
          </IconButton>
          <IconButton onClick={onToggleExpanded} title={expanded ? 'Salir de pantalla completa' : 'Pantalla completa'}>
            {expanded ? '⤡' : '⛶'}
          </IconButton>
        </div>
      </div>
    </div>
  )
}

function IconButton({ children, onClick, title }: { children: ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="grid h-9 w-9 place-items-center rounded-lg border border-ink-700 text-ink-200 transition-colors hover:border-ink-500 hover:text-paper"
    >
      {children}
    </button>
  )
}
