import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { creditCardService } from '@/features/credit-cards/services/credit-card.service'
import type { CreditCardInsert, CreditCardUpdate } from '@/types'

export const creditCardKeys = {
  all: ['credit-cards'] as const,
  lists: () => [...creditCardKeys.all, 'list'] as const,
  list: () => [...creditCardKeys.lists()] as const,
  details: () => [...creditCardKeys.all, 'detail'] as const,
  detail: (id: string) => [...creditCardKeys.details(), id] as const,
}

export function useCreditCards() {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: creditCardKeys.list(),
    queryFn: () => {
      if (!user?.id) throw new Error('Usuario nao autenticado')
      return creditCardService.getCreditCards(user.id)
    },
    enabled: !!user?.id,
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
      toast.success('Cartao criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar cartao. Tente novamente.')
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
      toast.success('Cartao atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar cartao. Tente novamente.')
    },
  })
}

export function useDeleteCreditCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => creditCardService.deleteCreditCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creditCardKeys.all })
      toast.success('Cartao excluido com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir cartao. Tente novamente.')
    },
  })
}
