import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  wide?: boolean
}

export function Section({ id, eyebrow, title, description, children, wide }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-court-800/80 py-16">
      <div className={`mx-auto px-6 ${wide ? 'max-w-6xl' : 'max-w-4xl'}`}>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-ace-400">{eyebrow}</p>
        )}
        <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
        {description && <div className="mt-3 max-w-2xl text-sm leading-relaxed text-court-200">{description}</div>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}
