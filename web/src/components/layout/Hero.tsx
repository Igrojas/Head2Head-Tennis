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

// `compact` se usa en la pestaña del grafo: ahí el espacio vertical importa
// más que la introducción, así que se reduce a una franja delgada con solo
// el título — sin la grilla de estadísticas.
export function Hero({ compact = false }: { compact?: boolean }) {
  const state = useFetchJSON<Stats>(dataUrl('stats.json'))
  const s = state.status === 'success' ? state.data : null

  return (
    <div id="top" className="relative overflow-hidden border-b border-ink-800/80">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 65% at 85% -15%, rgba(194,87,42,0.14), transparent), radial-gradient(45% 55% at -5% 0%, rgba(91,42,134,0.16), transparent), radial-gradient(35% 45% at 50% 100%, rgba(37,84,199,0.08), transparent)',
        }}
      />
      <div className={`relative mx-auto max-w-6xl px-6 ${compact ? 'py-6' : 'pb-12 pt-10 sm:pt-14'}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-clay-400">Analítica ATP · 1968–2023</p>
        <h1
          className={`mt-3 max-w-3xl font-display font-medium leading-[1.05] text-paper ${
            compact ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'
          }`}
        >
          Un recorrido por los números de los grandes del tenis
        </h1>
        {!compact && (
          <>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-200">
              Head-to-head, rankings históricos y rendimiento por temporada, construidos sobre{' '}
              {s ? nf.format(s.totalMatches) : '…'} partidos ATP registrados desde {s?.yearFrom ?? 1968} hasta{' '}
              {s?.yearTo ?? 2023}. El punto central: un grafo de rivalidades que puedes filtrar, explorar y manipular
              en vivo.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard value={s ? nf.format(s.totalMatches) : '—'} label="Partidos analizados" />
              <StatCard value={s ? nf.format(s.playersTotal) : '—'} label="Jugadores ATP" />
              <StatCard value={s ? `${s.yearTo - s.yearFrom + 1}` : '—'} label="Temporadas" />
              <StatCard value={s ? nf.format(s.networkNodes) : '—'} label="Nodos en el grafo" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
