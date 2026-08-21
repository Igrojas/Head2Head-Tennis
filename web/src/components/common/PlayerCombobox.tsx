import { useEffect, useMemo, useRef, useState } from 'react'
import type { PlayerSummary } from '../../types'

interface PlayerComboboxProps {
  players: PlayerSummary[]
  value: string | null
  onChange: (name: string) => void
  placeholder?: string
  quickPicks?: string[]
}

const MAX_RESULTS = 8

export function PlayerCombobox({ players, value, onChange, placeholder, quickPicks }: PlayerComboboxProps) {
  const [query, setQuery] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => setQuery(value ?? ''), [value])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = q
      ? players.filter((p) => p.name.toLowerCase().includes(q))
      : players.slice(0, MAX_RESULTS * 3)
    return pool.slice(0, MAX_RESULTS)
  }, [players, query])

  function pick(name: string) {
    onChange(name)
    setQuery(name)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative w-full max-w-md">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setHighlight(0)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlight((h) => Math.min(h + 1, results.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlight((h) => Math.max(h - 1, 0))
          } else if (e.key === 'Enter' && results[highlight]) {
            e.preventDefault()
            pick(results[highlight].name)
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        placeholder={placeholder ?? 'Busca un tenista…'}
        className="w-full rounded-lg border border-court-700 bg-court-900 px-4 py-2.5 text-sm text-white placeholder:text-court-300/50 outline-none ring-ace-400/40 focus:border-ace-400/60 focus:ring-2"
      />

      {quickPicks && quickPicks.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {quickPicks.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => pick(name)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                value === name
                  ? 'border-ace-400 bg-ace-400/10 text-ace-300'
                  : 'border-court-700 text-court-300 hover:border-court-500 hover:text-white'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-court-700 bg-court-850 shadow-xl shadow-black/40">
          {results.map((p, i) => (
            <li key={p.name}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(p.name)}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                  i === highlight ? 'bg-court-700 text-white' : 'text-court-200 hover:bg-court-800'
                }`}
              >
                <span>{p.name}</span>
                <span className="text-xs text-court-300">{p.wins}V · {p.winRate.toFixed(0)}%</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
