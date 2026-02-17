import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  ArrowLeft,
  Pencil,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/common/page-header'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { CreditCardVisual } from '@/features/credit-cards/components/credit-card-visual'
import { CreditCardForm } from '@/features/credit-cards/components/credit-card-form'
import { InvoiceDetail } from '@/features/credit-cards/components/invoice-detail'
import { InvoiceList } from '@/features/credit-cards/components/invoice-list'
import { RecurringExpenseList } from '@/features/credit-cards/components/recurring-expense-list'
import {
  useCreditCard,
  useDeleteCreditCard,
} from '@/features/credit-cards/hooks/use-credit-cards'
import { formatCurrency } from '@/lib/format'
import { getCurrentMonth, getCurrentYear } from '@/lib/date'

function CreditCardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: card, isLoading } = useCreditCard(id ?? '')
  const deleteCard = useDeleteCreditCard()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const currentMonth = getCurrentMonth()
  const currentYear = getCurrentYear()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="mx-auto aspect-[1.586/1] w-full max-w-[400px] rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!card) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cartão não encontrado" />
        <p className="text-muted-foreground">
          O cartão solicitado não existe ou foi removido.
        </p>
        <Button variant="outline" onClick={() => navigate('/credit-cards')}>
          <ArrowLeft className="size-4" />
          Voltar para Cartões
        </Button>
      </div>
    )
  }

  function handleDelete() {
    if (!card) return
    deleteCard.mutate(card.id, {
      onSuccess: () => navigate('/credit-cards'),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={card.name}
        description="Gerencie faturas e assinaturas deste cartão"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/credit-cards')}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setIsEditOpen(true)}>
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => setIsDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      </PageHeader>

      {/* Card Visual */}
      <div className="flex justify-center">
        <CreditCardVisual card={card} className="max-w-[400px]" />
      </div>

      {/* Card Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-xs text-muted-foreground">Limite</p>
          <p className="mt-1 font-semibold">{formatCurrency(card.card_limit)}</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-xs text-muted-foreground">Fechamento</p>
          <p className="mt-1 font-semibold">Dia {card.billing_day}</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-xs text-muted-foreground">Vencimento</p>
          <p className="mt-1 font-semibold">Dia {card.due_day}</p>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="current">
        <TabsList className="w-full">
          <TabsTrigger value="current" className="flex-1">
            Fatura Atual
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            Histórico
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex-1">
            Assinaturas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-4">
          <InvoiceDetail
            cardId={card.id}
            month={currentMonth}
            year={currentYear}
            billingDay={card.billing_day}
            dueDay={card.due_day}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <InvoiceList
            cardId={card.id}
            billingDay={card.billing_day}
            dueDay={card.due_day}
          />
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-4">
          <RecurringExpenseList cardId={card.id} />
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      <CreditCardForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        defaultValues={{
          id: card.id,
          name: card.name,
          last_four_digits: card.last_four_digits,
          brand: card.brand,
          card_limit: card.card_limit,
          billing_day: card.billing_day,
          due_day: card.due_day,
          color: card.color,
        }}
      />

      {/* Delete dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Excluir Cartão"
        description="Tem certeza que deseja excluir este cartão? Todas as faturas associadas também serão removidas. Esta ação não pode ser desfeita."
        variant="destructive"
        confirmText="Excluir"
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default CreditCardDetailPage
export { CreditCardDetailPage as Component }
