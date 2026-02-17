import { useState } from 'react'
import { isBefore } from 'date-fns'
import { Calendar, ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useInvoicesByCard } from '@/features/credit-cards/hooks/use-invoices'
import { InvoiceDetail } from '@/features/credit-cards/components/invoice-detail'
import { formatCurrency, capitalizeFirst } from '@/lib/format'
import { getMonthName } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { CreditCardInvoice } from '@/types'

interface InvoiceListProps {
  cardId: string
  billingDay: number
  dueDay: number
}

function getInvoiceStatus(invoice: CreditCardInvoice) {
  if (invoice.is_paid) return 'paid'
  const dueDate = new Date(invoice.due_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (isBefore(dueDate, today)) return 'overdue'
  return 'open'
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'paid':
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          Paga
        </Badge>
      )
    case 'overdue':
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
          Vencida
        </Badge>
      )
    default:
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          Aberta
        </Badge>
      )
  }
}

export function InvoiceList({ cardId, billingDay, dueDay }: InvoiceListProps) {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString()
  )
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null)

  const yearFilter =
    selectedYear === 'all' ? undefined : parseInt(selectedYear)
  const { data: invoices = [], isLoading } = useInvoicesByCard(
    cardId,
    yearFilter
  )

  const years = Array.from(
    { length: 5 },
    (_, i) => currentYear - i
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Historico de Faturas
        </h3>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {invoices.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          <Calendar className="mx-auto mb-2 size-8 opacity-50" />
          Nenhuma fatura encontrada.
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => {
            const status = getInvoiceStatus(invoice)
            const isExpanded = expandedInvoice === invoice.id

            return (
              <div key={invoice.id}>
                <Card
                  className={cn(
                    'cursor-pointer p-4 transition-colors hover:bg-accent/50',
                    isExpanded && 'bg-accent/30'
                  )}
                  onClick={() =>
                    setExpandedInvoice(isExpanded ? null : invoice.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ChevronRight
                        className={cn(
                          'size-4 text-muted-foreground transition-transform',
                          isExpanded && 'rotate-90'
                        )}
                      />
                      <div>
                        <p className="font-medium">
                          {capitalizeFirst(
                            getMonthName(invoice.month, invoice.year)
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Vencimento:{' '}
                          {new Date(
                            invoice.due_date + 'T00:00:00'
                          ).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {formatCurrency(invoice.total_amount)}
                      </span>
                      {getStatusBadge(status)}
                    </div>
                  </div>
                </Card>

                {isExpanded && (
                  <div className="ml-4 mt-2 border-l-2 border-muted pl-4">
                    <InvoiceDetail
                      cardId={cardId}
                      month={invoice.month}
                      year={invoice.year}
                      billingDay={billingDay}
                      dueDay={dueDay}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
