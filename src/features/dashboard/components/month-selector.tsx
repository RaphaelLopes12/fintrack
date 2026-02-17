import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMonthName, getPreviousMonth, getNextMonth } from '@/lib/date'
import { capitalizeFirst } from '@/lib/format'

interface MonthSelectorProps {
  month: number
  year: number
  onChange: (month: number, year: number) => void
}

export function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  function handlePrevious() {
    const prev = getPreviousMonth(month, year)
    onChange(prev.month, prev.year)
  }

  function handleNext() {
    const next = getNextMonth(month, year)
    onChange(next.month, next.year)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[180px] text-center text-sm font-medium">
        {capitalizeFirst(getMonthName(month, year))}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        aria-label="Proximo mes"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
