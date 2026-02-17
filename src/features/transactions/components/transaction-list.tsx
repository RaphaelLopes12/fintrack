import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TransactionWithCategory } from '@/types'

interface TransactionListProps {
  transactions: TransactionWithCategory[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

function groupByDate(
  transactions: TransactionWithCategory[]
): Record<string, TransactionWithCategory[]> {
  const groups: Record<string, TransactionWithCategory[]> = {}

  for (const tx of transactions) {
    const dateKey = tx.date
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(tx)
  }

  return groups
}

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const grouped = groupByDate(transactions)
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <>
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date}>
            {/* Date header */}
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {format(new Date(date), "dd 'de' MMMM, EEEE", {
                  locale: ptBR,
                })}
              </h3>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Desktop: table-like rows */}
            <div className="hidden space-y-1 md:block">
              {grouped[date].map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
                >
                  {/* Category color dot */}
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: tx.category.color }}
                  />

                  {/* Category badge */}
                  <Badge variant="secondary" className="text-xs">
                    {tx.category.name}
                  </Badge>

                  {/* Description */}
                  <span className="flex-1 truncate text-sm font-medium">
                    {tx.description}
                  </span>

                  {/* Recurring badge */}
                  {tx.is_recurring && (
                    <Badge variant="outline" className="text-xs">
                      Recorrente
                    </Badge>
                  )}

                  {/* Amount */}
                  <span
                    className={cn(
                      'min-w-[100px] text-right text-sm font-semibold',
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {tx.type === 'income' ? '+' : '-'}{' '}
                    {formatCurrency(tx.amount)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onEdit(tx.id)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setDeleteId(tx.id)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: card layout */}
            <div className="space-y-2 md:hidden">
              {grouped[date].map((tx) => (
                <div
                  key={tx.id}
                  className="rounded-lg border bg-card p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ backgroundColor: tx.category.color }}
                      />
                      <Badge variant="secondary" className="text-xs">
                        {tx.category.name}
                      </Badge>
                    </div>
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {tx.type === 'income' ? '+' : '-'}{' '}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium">{tx.description}</p>

                  {tx.is_recurring && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Recorrente
                    </Badge>
                  )}

                  <div className="mt-3 flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(tx.id)}
                    >
                      <Pencil className="size-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(tx.id)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
        title="Excluir Transacao"
        description="Tem certeza que deseja excluir esta transacao? Esta acao nao pode ser desfeita."
        onConfirm={() => {
          if (deleteId) onDelete(deleteId)
        }}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  )
}
