import { useParams, useNavigate } from 'react-router'
import { format } from 'date-fns'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/common/page-header'
import { TransactionForm } from '@/features/transactions/components/transaction-form'
import {
  useTransaction,
  useUpdateTransaction,
} from '@/features/transactions/hooks/use-transactions'
import type { TransactionFormData } from '@/features/transactions/schemas/transaction.schema'

function TransactionEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: transaction, isLoading } = useTransaction(id ?? '')
  const updateTransaction = useUpdateTransaction()

  async function handleSubmit(data: TransactionFormData) {
    if (!id) return

    await updateTransaction.mutateAsync({
      id,
      data: {
        type: data.type,
        amount: data.amount,
        description: data.description,
        category_id: data.category_id,
        credit_card_id: data.credit_card_id,
        date:
          data.date instanceof Date
            ? format(data.date, 'yyyy-MM-dd')
            : data.date,
        is_recurring: data.is_recurring,
        recurring_frequency: data.recurring_frequency,
        notes: data.notes ?? null,
      },
    })

    navigate('/transactions')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Editar Transacao"
          description="Edite os detalhes da transacao"
        />
        <Card className="mx-auto max-w-2xl">
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Transacao nao encontrada"
          description="A transacao que voce esta procurando nao existe."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Transacao"
        description="Edite os detalhes da transacao"
      />
      <Card className="mx-auto max-w-2xl">
        <CardContent>
          <TransactionForm
            defaultValues={{
              type: transaction.type,
              amount: transaction.amount,
              description: transaction.description,
              category_id: transaction.category_id,
              credit_card_id: transaction.credit_card_id,
              date: transaction.date,
              is_recurring: transaction.is_recurring,
              recurring_frequency: transaction.recurring_frequency,
              notes: transaction.notes ?? '',
            }}
            onSubmit={handleSubmit}
            isSubmitting={updateTransaction.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default TransactionEditPage
export { TransactionEditPage as Component }
