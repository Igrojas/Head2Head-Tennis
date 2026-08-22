import { Tabs, type TabItem } from './Tabs'

interface HeaderProps {
  tabs: TabItem[]
  active: string
  onChange: (id: string) => void
}

export function Header({ tabs, active, onChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-800/80 bg-ink-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <a href="#top" className="flex items-center gap-2.5 font-display text-base font-semibold text-paper">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-clay-500 text-xs text-paper">H2H</span>
          Head2Head Tennis
        </a>
        <a
          href="https://github.com/Igrojas/Head2Head-Tennis"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-ink-700 px-3 py-1.5 text-xs font-medium text-ink-200 transition-colors hover:border-ink-500 hover:text-paper"
        >
          Código fuente
        </a>
      </div>
      <div className="border-t border-ink-800/60">
        <div className="mx-auto max-w-6xl">
          <Tabs tabs={tabs} active={active} onChange={onChange} />
        </div>
      </div>
    </header>
  )
}
