import { centralityColor } from '../../lib/scales'

export function NetworkLegend() {
  return (
    <div className="flex flex-wrap items-center gap-6 border-t border-court-800 bg-court-900/70 px-4 py-3 text-xs text-court-300">
      <div className="flex items-center gap-2">
        <span>Centralidad de grado</span>
        <span
          className="h-2.5 w-28 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${centralityColor(0)}, ${centralityColor(0.5)}, ${centralityColor(1)})`,
          }}
        />
        <span>baja → alta</span>
      </div>
      <div className="flex items-center gap-2">
        <span>Tamaño del nodo</span>
        <span className="flex items-end gap-1">
          <span className="h-2 w-2 rounded-full bg-court-300" />
          <span className="h-3.5 w-3.5 rounded-full bg-court-300" />
          <span className="h-5 w-5 rounded-full bg-court-300" />
        </span>
        <span>= victorias de carrera</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-0.5 w-8 bg-court-500" />
        <span className="h-1 w-8 bg-court-300" />
        <span>grosor de arista = enfrentamientos directos</span>
      </div>
    </div>
  )
}
