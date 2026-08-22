import { centralityColor, edgeIntensityColor } from '../../lib/scales'

export function NetworkLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-ink-800 bg-ink-900/70 px-4 py-3 text-xs text-ink-300">
      <div className="flex items-center gap-2.5">
        <span className="flex items-end gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ink-300" />
          <span className="h-3.5 w-3.5 rounded-full bg-ink-300" />
          <span className="h-6 w-6 rounded-full bg-ink-300" />
        </span>
        <span>Tamaño = victorias de carrera</span>
      </div>

      <div className="flex items-center gap-2.5">
        <span
          className="h-2.5 w-24 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${centralityColor(0)}, ${centralityColor(0.5)}, ${centralityColor(1)})`,
          }}
        />
        <span>Color = qué tan conectado es (hub)</span>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="grid h-4 w-4 place-items-center rounded-full border-2 border-dashed border-ace-400 text-[9px] text-ace-400">
          ★
        </span>
        <span>Top 5 más conectados de la vista actual</span>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="flex items-center gap-1">
          <span className="h-px w-8 rounded-full opacity-45" style={{ background: edgeIntensityColor(0.15) }} />
          <span className="h-1 w-8 rounded-full" style={{ background: edgeIntensityColor(0.9) }} />
        </span>
        <span>Grosor y brillo = intensidad de la rivalidad</span>
      </div>
    </div>
  )
}
