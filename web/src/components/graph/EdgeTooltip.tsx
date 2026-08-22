import { createPortal } from 'react-dom'
import type { StyledEdge } from './types'

export function EdgeTooltip({ edge, x, y }: { edge: StyledEdge; x: number; y: number }) {
  const leads = edge.winsSource >= edge.winsTarget ? edge.source : edge.target
  return createPortal(
    <div
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-xs shadow-xl shadow-black/50"
      style={{ left: x, top: y }}
    >
      <p className="flex items-center gap-2 font-display font-medium text-paper">
        <span className="h-0.5 w-6 rounded-full" style={{ background: edge.color }} />
        {edge.source} vs {edge.target}
      </p>
      <p className="mt-1 text-ink-200">
        {edge.winsSource}–{edge.winsTarget} en {edge.totalMatches} enfrentamientos
      </p>
      <p className="text-ink-300">Lidera {leads}</p>
    </div>,
    document.body,
  )
}
