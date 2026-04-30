import { useState, useEffect } from 'react'

/**
 * @param value Valor a ser debounced
 * @param delay Atraso em milissegundos
 * @returns O valor atualizado após o atraso
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
