import { useEffect, useState } from 'react'

/** Devuelve `value` con un retraso, para no disparar trabajo pesado (ej. re-layout) en cada pixel de un slider. */
export function useDebouncedValue<T>(value: T, delayMs = 180): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}
