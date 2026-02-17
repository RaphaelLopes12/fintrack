import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, CreditCard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/common/page-header'
import { EmptyState } from '@/components/common/empty-state'
import { CreditCardVisual } from '@/features/credit-cards/components/credit-card-visual'
import { CreditCardForm } from '@/features/credit-cards/components/credit-card-form'
import { useCreditCards } from '@/features/credit-cards/hooks/use-credit-cards'
import { useInvoicesByCard } from '@/features/credit-cards/hooks/use-invoices'
import { formatCurrency, formatDateShort } from '@/lib/format'
import { getCurrentMonth, getCurrentYear, getInvoiceDueDate } from '@/lib/date'
import type { CreditCard as CreditCardType } from '@/types'

function CardSummary({ card }: { card: CreditCardType }) {
  const navigate = useNavigate()
  const currentMonth = getCurrentMonth()
  const currentYear = getCurrentYear()
  const { data: invoices = [] } = useInvoicesByCard(card.id)

  const currentInvoice = invoices.find(
    (inv) => inv.month === currentMonth && inv.year === currentYear
  )

  const dueDate = getInvoiceDueDate(card.due_day, currentMonth, currentYear)
  const invoiceTotal = currentInvoice?.total_amount ?? 0

  return (
    <div className="space-y-3">
      <CreditCardVisual
        card={card}
        onClick={() => navigate(`/credit-cards/${card.id}`)}
      />
      <div className="space-y-1 px-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Fatura atual</span>
          <span className="font-semibold">{formatCurrency(invoiceTotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Limite</span>
          <span>{formatCurrency(card.card_limit)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Vencimento</span>
          <span>{formatDateShort(dueDate)}</span>
        </div>
        {card.card_limit > 0 && (
          <div className="mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${Math.min(100, (invoiceTotal / card.card_limit) * 100)}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {((invoiceTotal / card.card_limit) * 100).toFixed(1)}% do limite
              utilizado
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function CreditCardsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { data: cards = [], isLoading } = useCreditCards()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cartões de Crédito"
        description="Gerencie seus cartões e faturas"
      >
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="size-4" />
          Adicionar Cartão
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[1.586/1] w-full rounded-2xl" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      ) : cards.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Nenhum cartão cadastrado"
          description="Adicione seu primeiro cartão de crédito para começar a gerenciar suas faturas."
          action={
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="size-4" />
              Adicionar Cartão
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <CardSummary key={card.id} card={card} />
          ))}
        </div>
      )}

      <CreditCardForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  )
}

export default CreditCardsPage
export { CreditCardsPage as Component }
