import { useNavigate } from 'react-router'
import { format } from 'date-fns'

import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/common/page-header'
import { TransactionForm } from '@/features/transactions/components/transaction-form'
import { useCreateTransaction } from '@/features/transactions/hooks/use-transactions'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { TransactionFormData } from '@/features/transactions/schemas/transaction.schema'

function TransactionNewPage() {
  const navigate = useNavigate()
  const user = useAuth((state) => state.user)
  const createTransaction = useCreateTransaction()

  async function handleSubmit(data: TransactionFormData) {
    if (!user?.id) return

    await createTransaction.mutateAsync({
      user_id: user.id,
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
    })

    navigate('/transactions')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova Transação"
        description="Adicione uma nova receita ou despesa"
      />
      <Card className="mx-auto max-w-2xl">
        <CardContent>
          <TransactionForm
            onSubmit={handleSubmit}
            isSubmitting={createTransaction.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default TransactionNewPage
export { TransactionNewPage as Component }
