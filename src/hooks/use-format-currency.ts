import { useCallback } from 'react'

export function useFormatCurrency() {
  const format = useCallback((value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }, [])

  const parse = useCallback((value: string): number => {
    const cleaned = value
      .replace(/[R$\s]/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
    return parseFloat(cleaned) || 0
  }, [])

  return { format, parse }
}
