interface TooltipEntry {
  dataKey?: string | number
  name?: string | number
  value?: string | number
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-xs shadow-lg shadow-black/40">
      {label !== undefined && <p className="mb-1 font-medium text-paper">{label}</p>}
      {payload.map((entry, i) => (
        <p key={String(entry.dataKey ?? i)} className="flex items-center gap-2 text-ink-200">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: <span className="font-medium text-paper">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}
