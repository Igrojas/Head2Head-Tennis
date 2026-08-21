const NAV = [
  { href: '#h2h', label: 'Head-to-Head' },
  { href: '#rankings', label: 'Rankings' },
  { href: '#rendimiento', label: 'Rendimiento' },
  { href: '#grafo', label: 'Grafo de rivalidades' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-court-800/80 bg-court-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <a href="#top" className="flex items-center gap-2 font-display text-sm font-semibold text-white">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-ace-400 text-court-950">H2H</span>
          Head2Head Tennis
        </a>
        <nav className="hidden items-center gap-6 text-sm text-court-200 sm:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="https://github.com/Igrojas/Head2Head-Tennis"
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-court-700 px-3 py-1.5 text-xs font-medium text-court-200 transition-colors hover:border-court-500 hover:text-white"
        >
          Código fuente
        </a>
      </div>
    </header>
  )
}
