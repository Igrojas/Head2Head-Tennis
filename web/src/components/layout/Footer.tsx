const MAJORS = [
  { name: 'Australian Open', color: '#5b82e0' },
  { name: 'Roland Garros', color: '#dd7c4c' },
  { name: 'Wimbledon', color: '#8256ad' },
  { name: 'US Open', color: '#d7ff5f' },
]

export function Footer() {
  return (
    <footer className="border-t border-ink-800/80 py-10 text-center text-xs text-ink-300">
      <p>
        Datos históricos ATP 1968–2023 de{' '}
        <a
          href="https://github.com/JeffSackmann/tennis_atp"
          target="_blank"
          rel="noreferrer"
          className="text-clay-400 hover:underline"
        >
          Jeff Sackmann
        </a>
        .
      </p>
      <p className="mt-1">
        Código en{' '}
        <a
          href="https://github.com/Igrojas/Head2Head-Tennis"
          target="_blank"
          rel="noreferrer"
          className="text-clay-400 hover:underline"
        >
          github.com/Igrojas/Head2Head-Tennis
        </a>
      </p>
      <div className="mt-4 flex items-center justify-center gap-3 text-[10px] uppercase tracking-wide text-ink-300/70">
        <span>Paleta inspirada en los cuatro Grand Slam</span>
        <span className="flex items-center gap-2">
          {MAJORS.map((m) => (
            <span key={m.name} className="flex items-center gap-1" title={m.name}>
              <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
            </span>
          ))}
        </span>
      </div>
    </footer>
  )
}
