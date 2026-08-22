import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useFetchJSON } from './useFetchJSON'
import { dataUrl } from './paths'
import type { PlayerSummary } from '../types'

interface PlayersContextValue {
  status: 'idle' | 'loading' | 'error' | 'success'
  players: PlayerSummary[]
  byName: Map<string, PlayerSummary>
}

const PlayersContext = createContext<PlayersContextValue | null>(null)

export function PlayersProvider({ children }: { children: ReactNode }) {
  const state = useFetchJSON<PlayerSummary[]>(dataUrl('players.json'))

  const value = useMemo<PlayersContextValue>(() => {
    const players = state.status === 'success' ? state.data : []
    return {
      status: state.status,
      players,
      byName: new Map(players.map((p) => [p.name, p])),
    }
  }, [state])

  return <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>
}

export function usePlayers() {
  const ctx = useContext(PlayersContext)
  if (!ctx) throw new Error('usePlayers debe usarse dentro de <PlayersProvider>')
  return ctx
}
