import { useState } from 'react'
import { Plus, Repeat, Trash2, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useRecurringExpenses,
  useToggleRecurringExpense,
  useDeleteRecurringExpense,
} from '@/features/credit-cards/hooks/use-recurring-expenses'
import { useCanEdit } from '@/features/sharing/hooks/use-shared-context'
import { RecurringExpenseForm } from '@/features/credit-cards/components/recurring-expense-form'
import { formatCurrency } from '@/lib/format'
import { FREQUENCIES } from '@/lib/constants'
import type { RecurringExpense } from '@/types'

interface RecurringExpenseListProps {
  cardId?: string
}

function getFrequencyLabel(frequency: string): string {
  const found = FREQUENCIES.find((f) => f.value === frequency)
  return found?.label ?? frequency
}

export function RecurringExpenseList({ cardId }: RecurringExpenseListProps) {
  const canEdit = useCanEdit()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<
    (RecurringExpense & { category?: { name: string; color: string } }) | null
  >(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: expenses = [], isLoading } = useRecurringExpenses(cardId)
  const toggleExpense = useToggleRecurringExpense()
  const deleteExpense = useDeleteRecurringExpense()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Assinaturas e Recorrências
        </h3>
        {canEdit && (
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="size-4" />
            Adicionar
          </Button>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          <Repeat className="mx-auto mb-2 size-8 opacity-50" />
          Nenhuma assinatura cadastrada.
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense: RecurringExpense & { category?: { name: string; color: string }; credit_card?: { name: string } | null }) => (
            <Card key={expense.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={expense.is_active}
                    disabled={!canEdit}
                    onCheckedChange={(checked) =>
                      toggleExpense.mutate({
                        id: expense.id,
                        isActive: checked,
                      })
                    }
                  />
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {expense.category && (
                        <span className="flex items-center gap-1">
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: expense.category.color,
                            }}
                          />
                          {expense.category.name}
                        </span>
                      )}
                      <span>-</span>
                      <span>{getFrequencyLabel(expense.frequency)}</span>
                      {expense.credit_card && (
                        <>
                          <span>-</span>
                          <span>{expense.credit_card.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">
                    {formatCurrency(expense.amount)}
                  </span>
                  {!expense.is_active && (
                    <Badge variant="secondary">Inativa</Badge>
                  )}
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setEditingExpense(expense)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletingId(expense.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create form */}
      <RecurringExpenseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        creditCardId={cardId}
      />

      {/* Edit form */}
      {editingExpense && (
        <RecurringExpenseForm
          open={!!editingExpense}
          onOpenChange={(open) => {
            if (!open) setEditingExpense(null)
          }}
          defaultValues={{
            id: editingExpense.id,
            description: editingExpense.description,
            amount: editingExpense.amount,
            category_id: editingExpense.category_id,
            credit_card_id: editingExpense.credit_card_id,
            frequency: editingExpense.frequency,
            start_date: editingExpense.start_date,
            end_date: editingExpense.end_date,
          }}
          creditCardId={cardId}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null)
        }}
        title="Excluir Assinatura"
        description="Tem certeza que deseja excluir esta assinatura? Esta ação não pode ser desfeita."
        variant="destructive"
        confirmText="Excluir"
        onConfirm={() => {
          if (deletingId) {
            deleteExpense.mutate(deletingId)
            setDeletingId(null)
          }
        }}
      />
    </div>
  )
}
