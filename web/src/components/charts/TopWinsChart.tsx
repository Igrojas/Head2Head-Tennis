import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { usePlayers } from '../../lib/PlayersContext'
import { ChartTooltip } from './ChartTooltip'
import { Loader } from '../common/AsyncState'

export function TopWinsChart() {
  const { status, players } = usePlayers()
  const top = useMemo(() => [...players].sort((a, b) => b.wins - a.wins).slice(0, 20).reverse(), [players])

  if (status !== 'success') return <Loader />

  return (
    <div className="h-[520px] w-full rounded-xl border border-court-800 bg-court-900/50 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#24382f" horizontal={false} />
          <XAxis type="number" stroke="#8fb89e" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis type="category" dataKey="name" stroke="#8fb89e" tick={{ fontSize: 11, fill: '#eef3ee' }} width={150} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="wins" name="Victorias" fill="#d7ff5f" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
