import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { usePlayers } from '../../lib/PlayersContext'
import { ChartTooltip } from './ChartTooltip'
import { Loader } from '../common/AsyncState'

export function TopPerformanceChart() {
  const { status, players } = usePlayers()
  const top = useMemo(
    () =>
      [...players]
        .filter((p) => p.totalMatches >= 100)
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 20)
        .reverse(),
    [players],
  )

  if (status !== 'success') return <Loader />

  return (
    <div className="h-[520px] w-full rounded-xl border border-court-800 bg-court-900/50 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical" margin={{ top: 8, right: 40, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#24382f" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} stroke="#8fb89e" tick={{ fontSize: 12 }} unit="%" />
          <YAxis type="category" dataKey="name" stroke="#8fb89e" tick={{ fontSize: 11, fill: '#eef3ee' }} width={150} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="winRate" name="Rendimiento" fill="#c96a3e" radius={[0, 4, 4, 0]}>
            <LabelList
              dataKey="winRate"
              position="right"
              formatter={(v: unknown) => `${Number(v).toFixed(1)}%`}
              fill="#c3ddca"
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
