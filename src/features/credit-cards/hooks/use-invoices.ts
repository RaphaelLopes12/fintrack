import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invoiceService } from '@/features/credit-cards/services/invoice.service'
import { creditCardKeys } from '@/features/credit-cards/hooks/use-credit-cards'

export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  listByCard: (cardId: string, year?: number) =>
    [...invoiceKeys.lists(), cardId, { year }] as const,
  transactions: (cardId: string, month: number, year: number) =>
    [...invoiceKeys.all, 'transactions', cardId, { month, year }] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
}

export function useInvoicesByCard(cardId: string, year?: number) {
  return useQuery({
    queryKey: invoiceKeys.listByCard(cardId, year),
    queryFn: () => invoiceService.getInvoicesByCard(cardId, year),
    enabled: !!cardId,
  })
}

export function useInvoiceTransactions(
  cardId: string,
  month: number,
  year: number,
  billingDay: number
) {
  return useQuery({
    queryKey: invoiceKeys.transactions(cardId, month, year),
    queryFn: () =>
      invoiceService.getInvoiceTransactions(cardId, month, year, billingDay),
    enabled: !!cardId && !!month && !!year && !!billingDay,
  })
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invoiceId: string) =>
      invoiceService.markInvoicePaid(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
      queryClient.invalidateQueries({ queryKey: creditCardKeys.all })
      toast.success('Fatura marcada como paga!')
    },
    onError: () => {
      toast.error('Erro ao marcar fatura como paga. Tente novamente.')
    },
  })
}

export function useMarkInvoiceUnpaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invoiceId: string) =>
      invoiceService.markInvoiceUnpaid(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all })
      queryClient.invalidateQueries({ queryKey: creditCardKeys.all })
      toast.success('Pagamento da fatura desfeito!')
    },
    onError: () => {
      toast.error('Erro ao desfazer pagamento. Tente novamente.')
    },
  })
}
