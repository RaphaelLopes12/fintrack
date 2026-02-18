import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { creditCardService } from '@/features/credit-cards/services/credit-card.service'
import { useActiveUserId } from '@/features/sharing/hooks/use-shared-context'
import type { CreditCardInsert, CreditCardUpdate } from '@/types'

export const creditCardKeys = {
  all: ['credit-cards'] as const,
  lists: () => [...creditCardKeys.all, 'list'] as const,
  list: () => [...creditCardKeys.lists()] as const,
  details: () => [...creditCardKeys.all, 'detail'] as const,
  detail: (id: string) => [...creditCardKeys.details(), id] as const,
}

export function useCreditCards() {
  const activeUserId = useActiveUserId()

  return useQuery({
    queryKey: [...creditCardKeys.list(), activeUserId],
    queryFn: () => {
      if (!activeUserId) throw new Error('Usuário não autenticado')
      return creditCardService.getCreditCards(activeUserId)
    },
    enabled: !!activeUserId,
  })
}

export function useCreditCard(id: string) {
  return useQuery({
    queryKey: creditCardKeys.detail(id),
    queryFn: () => creditCardService.getCreditCardById(id),
    enabled: !!id,
  })
}

export function useCreateCreditCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreditCardInsert) =>
      creditCardService.createCreditCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.lists() })
      toast.success('Cartão criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar cartão. Tente novamente.')
    },
  })
}

export function useUpdateCreditCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreditCardUpdate }) =>
      creditCardService.updateCreditCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.all })
      toast.success('Cartão atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar cartão. Tente novamente.')
    },
  })
}

export function useDeleteCreditCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => creditCardService.deleteCreditCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.all })
      toast.success('Cartão excluído com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir cartão. Tente novamente.')
    },
  })
}
