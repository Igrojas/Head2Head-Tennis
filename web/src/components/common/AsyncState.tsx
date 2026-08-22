import type { ReactNode } from 'react'

export function Loader({ label = 'Cargando datos…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-ink-800 bg-ink-900/60 px-4 py-6 text-sm text-ink-300">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-500 border-t-clay-400" />
      {label}
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-clay-500/40 bg-clay-500/10 px-4 py-6 text-sm text-clay-300">
      No se pudieron cargar los datos ({message}).
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-ink-700 px-4 py-10 text-center text-sm text-ink-300">
      {children}
    </div>
  )
}
