import { useEffect, useRef, useState } from 'react'

type State<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T }

/**
 * Trae un JSON estático de /public/data bajo demanda. `path` en `null`
 * pausa el fetch (útil mientras no hay un jugador seleccionado todavía).
 */
export function useFetchJSON<T>(path: string | null): State<T> {
  const [state, setState] = useState<State<T>>({ status: 'idle' })
  const requestId = useRef(0)

  useEffect(() => {
    if (!path) {
      setState({ status: 'idle' })
      return
    }
    const id = ++requestId.current
    setState({ status: 'loading' })

    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        return res.json() as Promise<T>
      })
      .then((data) => {
        if (requestId.current === id) setState({ status: 'success', data })
      })
      .catch((err: unknown) => {
        if (requestId.current === id) {
          setState({ status: 'error', error: err instanceof Error ? err.message : 'Error desconocido' })
        }
      })

    return () => {
      requestId.current++
    }
  }, [path])

  return state
}
