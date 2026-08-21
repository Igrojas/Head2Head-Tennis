import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useFetchJSON } from '../../lib/useFetchJSON'
import { dataUrl } from '../../lib/paths'
import { usePlayers } from '../../lib/PlayersContext'
import type { PerformanceRow } from '../../types'
import { ChartTooltip } from './ChartTooltip'
import { Loader, ErrorState, EmptyState } from '../common/AsyncState'

export function PerformanceByYearChart({ player }: { player: string | null }) {
  const { byName } = usePlayers()
  const slug = player ? byName.get(player)?.slug ?? null : null
  const state = useFetchJSON<PerformanceRow[]>(slug ? dataUrl(`performance/${slug}.json`) : null)

  if (!player) return <EmptyState>Elige un tenista para ver su evolución año a año.</EmptyState>
  if (state.status === 'loading' || state.status === 'idle') return <Loader label={`Cargando rendimiento de ${player}…`} />
  if (state.status === 'error') return <ErrorState message={state.error} />
  if (state.data.length === 0) return <EmptyState>No hay temporadas registradas para {player}.</EmptyState>

  return (
    <div className="h-[380px] w-full rounded-xl border border-court-800 bg-court-900/50 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={state.data} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#24382f" />
          <XAxis dataKey="year" stroke="#8fb89e" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} stroke="#8fb89e" tick={{ fontSize: 12 }} unit="%" />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine y={80} stroke="#c96a3e" strokeDasharray="4 4" label={{ value: '80%', fill: '#c96a3e', fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="rendimiento"
            name="Rendimiento"
            stroke="#d7ff5f"
            strokeWidth={2}
            dot={{ r: 3, fill: '#0f1712', stroke: '#d7ff5f', strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
