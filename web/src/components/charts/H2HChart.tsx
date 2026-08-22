import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useFetchJSON } from '../../lib/useFetchJSON'
import { dataUrl } from '../../lib/paths'
import { usePlayers } from '../../lib/PlayersContext'
import type { H2HRow } from '../../types'
import { ChartTooltip } from './ChartTooltip'
import { Loader, ErrorState, EmptyState } from '../common/AsyncState'

export function H2HChart({ player }: { player: string | null }) {
  const { byName } = usePlayers()
  const slug = player ? byName.get(player)?.slug ?? null : null
  const state = useFetchJSON<H2HRow[]>(slug ? dataUrl(`h2h/${slug}.json`) : null)

  const top = useMemo(() => {
    if (state.status !== 'success') return []
    return [...state.data].sort((a, b) => b.total - a.total).slice(0, 10).reverse()
  }, [state])

  if (!player) return <EmptyState>Elige un tenista para ver sus principales rivalidades.</EmptyState>
  if (state.status === 'loading' || state.status === 'idle') return <Loader label={`Cargando H2H de ${player}…`} />
  if (state.status === 'error') return <ErrorState message={state.error} />
  if (top.length === 0) return <EmptyState>No hay enfrentamientos registrados para {player}.</EmptyState>

  return (
    <div className="h-[420px] w-full rounded-xl border border-court-800 bg-court-900/50 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#24382f" horizontal={false} />
          <XAxis type="number" stroke="#8fb89e" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="rival"
            stroke="#8fb89e"
            tick={{ fontSize: 12, fill: '#eef3ee' }}
            width={150}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#c3ddca' }} />
          <Bar dataKey="wins" name="Victorias" stackId="a" fill="#d7ff5f" />
          <Bar dataKey="losses" name="Derrotas" stackId="a" fill="#c96a3e" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
