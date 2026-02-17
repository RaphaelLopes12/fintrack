import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Plus, Receipt } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/common/page-header'
import { EmptyState } from '@/components/common/empty-state'
import { TransactionList } from '@/features/transactions/components/transaction-list'
import {
  TransactionFilters,
  type TransactionFilterState,
} from '@/features/transactions/components/transaction-filters'
import { CategoryManager } from '@/features/transactions/components/category-manager'
import {
  useTransactions,
  useDeleteTransaction,
} from '@/features/transactions/hooks/use-transactions'
import { getCurrentMonth, getCurrentYear } from '@/lib/date'

function TransactionsPage() {
  const navigate = useNavigate()

  const [filters, setFilters] = useState<TransactionFilterState>({
    month: getCurrentMonth(),
    year: getCurrentYear(),
  })

  const { data: transactions = [], isLoading } = useTransactions({
    month: filters.month,
    year: filters.year,
    categoryId: filters.categoryId,
    type: filters.type,
    search: filters.search,
  })

  const deleteTransaction = useDeleteTransaction()

  function handleEdit(id: string) {
    navigate(`/transactions/${id}/edit`)
  }

  function handleDelete(id: string) {
    deleteTransaction.mutate(id)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transacoes"
        description="Gerencie suas receitas e despesas"
      >
        <Button asChild>
          <Link to="/transactions/new">
            <Plus className="size-4" />
            Nova Transacao
          </Link>
        </Button>
      </PageHeader>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transacoes</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionFilters filters={filters} onChange={setFilters} />

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Nenhuma transacao encontrada"
              description="Voce ainda nao possui transacoes para este periodo. Comece adicionando sua primeira transacao."
              action={
                <Button asChild>
                  <Link to="/transactions/new">
                    <Plus className="size-4" />
                    Nova Transacao
                  </Link>
                </Button>
              }
            />
          ) : (
            <TransactionList
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TransactionsPage
export { TransactionsPage as Component }
