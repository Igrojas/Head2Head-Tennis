import { useFetchJSON } from '../../lib/useFetchJSON'
import { dataUrl } from '../../lib/paths'
import { StatCard } from '../common/StatCard'

interface Stats {
  playersTotal: number
  playersCatalog: number
  totalMatches: number
  yearFrom: number
  yearTo: number
  networkNodes: number
  networkEdges: number
}

const nf = new Intl.NumberFormat('es-ES')

export function Hero() {
  const state = useFetchJSON<Stats>(dataUrl('stats.json'))
  const s = state.status === 'success' ? state.data : null

  return (
    <div id="top" className="relative overflow-hidden border-b border-court-800/80">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 60% at 80% -10%, rgba(215,255,95,0.12), transparent), radial-gradient(50% 50% at 0% 0%, rgba(201,106,62,0.12), transparent)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-24">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ace-400">Analítica ATP · 1968–2023</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.05] text-white sm:text-5xl">
          Un recorrido por los números de los grandes del tenis
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-court-200">
          Head-to-head, rankings históricos y rendimiento por temporada, construidos sobre{' '}
          {s ? nf.format(s.totalMatches) : '…'} partidos ATP registrados desde {s?.yearFrom ?? 1968} hasta{' '}
          {s?.yearTo ?? 2023}. El punto central: un grafo de rivalidades que puedes filtrar, explorar y manipular en
          vivo.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard value={s ? nf.format(s.totalMatches) : '—'} label="Partidos analizados" />
          <StatCard value={s ? nf.format(s.playersTotal) : '—'} label="Jugadores ATP" />
          <StatCard value={s ? `${s.yearTo - s.yearFrom + 1}` : '—'} label="Temporadas" />
          <StatCard value={s ? nf.format(s.networkNodes) : '—'} label="Nodos en el grafo" />
        </div>
      </div>
    </div>
  )
}
