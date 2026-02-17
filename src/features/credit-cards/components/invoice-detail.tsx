import { isBefore } from 'date-fns'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useInvoiceTransactions,
  useMarkInvoicePaid,
  useMarkInvoiceUnpaid,
} from '@/features/credit-cards/hooks/use-invoices'
import { invoiceService } from '@/features/credit-cards/services/invoice.service'
import { formatCurrency, formatDateShort } from '@/lib/format'
import { getBillingPeriod, getInvoiceDueDate } from '@/lib/date'
import { useQuery } from '@tanstack/react-query'
import { invoiceKeys } from '@/features/credit-cards/hooks/use-invoices'

interface InvoiceDetailProps {
  cardId: string
  month: number
  year: number
  billingDay: number
  dueDay: number
}

export function InvoiceDetail({
  cardId,
  month,
  year,
  billingDay,
  dueDay,
}: InvoiceDetailProps) {
  const { data: transactions = [], isLoading: isLoadingTx } =
    useInvoiceTransactions(cardId, month, year, billingDay)

  const { data: invoice, isLoading: isLoadingInvoice } = useQuery({
    queryKey: [...invoiceKeys.all, 'current', cardId, month, year],
    queryFn: () => invoiceService.createOrGetInvoice(cardId, month, year, dueDay),
    enabled: !!cardId && !!month && !!year,
  })

  const markPaid = useMarkInvoicePaid()
  const markUnpaid = useMarkInvoiceUnpaid()

  const { start, end } = getBillingPeriod(billingDay, month, year)
  const dueDateObj = getInvoiceDueDate(dueDay, month, year)

  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isPaid = invoice?.is_paid ?? false
  const isOverdue = !isPaid && isBefore(dueDateObj, today)

  const isToggling = markPaid.isPending || markUnpaid.isPending

  if (isLoadingTx || isLoadingInvoice) {
    return (
      <div className="space-y-3 py-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4 py-2">
      {/* Status */}
      <div className="flex items-center gap-2">
        {isPaid ? (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle2 className="mr-1 size-3" />
            Paga
          </Badge>
        ) : isOverdue ? (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="mr-1 size-3" />
            Vencida
          </Badge>
        ) : (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Calendar className="mr-1 size-3" />
            Aberta
          </Badge>
        )}
      </div>

      {/* Billing period info */}
      <div className="rounded-lg bg-muted/50 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Período:</span>
          <span>
            {formatDateShort(start)} - {formatDateShort(end)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Vencimento:</span>
          <span>{formatDateShort(dueDateObj)}</span>
        </div>
      </div>

      {/* Transactions */}
      {transactions.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Nenhuma transação neste período.
        </div>
      ) : (
        <div className="space-y-1">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-accent/50"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: tx.category.color }}
                />
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateShort(tx.date)} - {tx.category.name}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-red-500">
                -{formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* Total */}
      <div className="flex items-center justify-between font-semibold">
        <span>Total da Fatura</span>
        <span className="text-lg">{formatCurrency(total)}</span>
      </div>

      {/* Pay/Unpay button */}
      {invoice && (
        <Button
          className="w-full"
          variant={isPaid ? 'outline' : 'default'}
          disabled={isToggling}
          onClick={() => {
            if (isPaid) {
              markUnpaid.mutate(invoice.id)
            } else {
              markPaid.mutate(invoice.id)
            }
          }}
        >
          {isToggling && <Loader2 className="size-4 animate-spin" />}
          {isPaid ? 'Desfazer Pagamento' : 'Pagar Fatura'}
        </Button>
      )}
    </div>
  )
}
