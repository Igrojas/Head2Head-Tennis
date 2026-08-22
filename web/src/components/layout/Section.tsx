import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  wide?: boolean
}

// Contenido de una pestaña activa. Antes esto era un tramo dentro de un
// scroll largo (de ahí el nombre); ahora es el único panel visible, así que
// no lleva borde superior ni scroll-margin — solo una entrada suave.
export function Section({ id, eyebrow, title, description, children, wide }: SectionProps) {
  return (
    <section id={id} className="panel-enter py-10 sm:py-12">
      <div className={`mx-auto px-6 ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}>
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay-400">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-medium text-paper sm:text-3xl">{title}</h2>
        {description && <div className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-200">{description}</div>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}
