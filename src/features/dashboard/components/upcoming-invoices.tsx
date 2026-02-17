import { CreditCard, CalendarClock } from 'lucide-react'
import { differenceInDays } from 'date-fns'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { formatCurrency, formatDateShort } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useUpcomingInvoices } from '@/features/dashboard/hooks/use-dashboard-data'

function getDaysUntilDue(dueDate: string): number {
  return differenceInDays(new Date(dueDate), new Date())
}

function getDueColorClass(daysUntil: number): string {
  if (daysUntil < 3) return 'text-red-600 dark:text-red-400'
  if (daysUntil <= 7) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

function getDueBgClass(daysUntil: number): string {
  if (daysUntil < 3) return 'bg-red-100 dark:bg-red-950'
  if (daysUntil <= 7) return 'bg-yellow-100 dark:bg-yellow-950'
  return 'bg-emerald-100 dark:bg-emerald-950'
}

function formatBrandName(brand: string): string {
  const brands: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    elo: 'Elo',
    amex: 'Amex',
    hipercard: 'Hipercard',
    other: 'Outro',
  }
  return brands[brand] ?? brand
}

export function UpcomingInvoices() {
  const { data: invoices, isLoading } = useUpcomingInvoices()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faturas Proximas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faturas Proximas</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CalendarClock}
            title="Nenhuma fatura proxima"
            description="Nao ha faturas de cartao vencendo nos proximos 30 dias."
            className="py-8"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturas Proximas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const daysUntil = getDaysUntilDue(invoice.due_date)
            const colorClass = getDueColorClass(daysUntil)
            const bgClass = getDueBgClass(daysUntil)

            return (
              <div
                key={invoice.id}
                className={cn(
                  'flex items-center gap-4 rounded-lg border p-3',
                  bgClass
                )}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                  <CreditCard className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {invoice.credit_card.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {formatBrandName(invoice.credit_card.brand)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vencimento: {formatDateShort(invoice.due_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {formatCurrency(invoice.total_amount)}
                  </p>
                  <p className={cn('text-xs font-medium', colorClass)}>
                    {daysUntil === 0
                      ? 'Vence hoje'
                      : daysUntil === 1
                        ? 'Vence amanha'
                        : `${daysUntil} dias`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
