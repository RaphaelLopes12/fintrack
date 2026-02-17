import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { useCategories } from '@/features/transactions/hooks/use-categories'
import { getMonthName, getNextMonth, getPreviousMonth } from '@/lib/date'
import { capitalizeFirst } from '@/lib/format'

export interface TransactionFilterState {
  month: number
  year: number
  type?: 'income' | 'expense'
  categoryId?: string
  search?: string
}

interface TransactionFiltersProps {
  filters: TransactionFilterState
  onChange: (filters: TransactionFilterState) => void
}

export function TransactionFilters({
  filters,
  onChange,
}: TransactionFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '')
  const [showFilters, setShowFilters] = useState(false)

  const { data: categories = [] } = useCategories(filters.type)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search ?? '')) {
        onChange({ ...filters, search: searchInput || undefined })
      }
    }, 400)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  function handlePreviousMonth() {
    const { month, year } = getPreviousMonth(filters.month, filters.year)
    onChange({ ...filters, month, year })
  }

  function handleNextMonth() {
    const { month, year } = getNextMonth(filters.month, filters.year)
    onChange({ ...filters, month, year })
  }

  function handleTypeChange(value: string) {
    const type =
      value === 'all' ? undefined : (value as 'income' | 'expense')
    onChange({ ...filters, type, categoryId: undefined })
  }

  function handleCategoryChange(value: string) {
    onChange({
      ...filters,
      categoryId: value === '__all__' ? undefined : value,
    })
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        {/* Month navigation + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Month/Year nav */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[160px] text-center text-sm font-medium">
              {capitalizeFirst(getMonthName(filters.month, filters.year))}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Search + filter toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="size-4" />
            </Button>
          </div>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center">
            {/* Type filter */}
            <Tabs
              value={filters.type ?? 'all'}
              onValueChange={handleTypeChange}
            >
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="income">Receitas</TabsTrigger>
                <TabsTrigger value="expense">Despesas</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Category filter */}
            <Select
              value={filters.categoryId ?? '__all__'}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
