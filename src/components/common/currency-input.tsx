import { forwardRef, useCallback } from 'react'
import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function parseBRL(value: string): number {
  const cleaned = value
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  return parseFloat(cleaned) || 0
}

interface CurrencyInputProps
  extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value: number
  onChange: (value: number) => void
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ value, onChange, ...props }, ref) {
    const displayValue = formatBRL(value)

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value
        const numericValue = parseBRL(rawValue)
        onChange(numericValue)
      },
      [onChange]
    )

    return (
      <Input
        ref={ref}
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
