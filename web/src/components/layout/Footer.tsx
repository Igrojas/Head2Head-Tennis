export function Footer() {
  return (
    <footer className="border-t border-court-800/80 py-10 text-center text-xs text-court-300">
      <p>
        Datos históricos ATP 1968–2023 de{' '}
        <a
          href="https://github.com/JeffSackmann/tennis_atp"
          target="_blank"
          rel="noreferrer"
          className="text-ace-400 hover:underline"
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
          className="text-ace-400 hover:underline"
        >
          github.com/Igrojas/Head2Head-Tennis
        </a>
      </p>
    </footer>
  )
}
