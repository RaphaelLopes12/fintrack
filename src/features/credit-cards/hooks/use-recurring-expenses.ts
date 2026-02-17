import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { recurringExpenseService } from '@/features/credit-cards/services/recurring-expense.service'
import type { RecurringExpenseInsert, RecurringExpenseUpdate } from '@/types'

export const recurringKeys = {
  all: ['recurring-expenses'] as const,
  lists: () => [...recurringKeys.all, 'list'] as const,
  list: (cardId?: string) => [...recurringKeys.lists(), { cardId }] as const,
}

export function useRecurringExpenses(cardId?: string) {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: recurringKeys.list(cardId),
    queryFn: () => {
      if (!user?.id) throw new Error('Usuario nao autenticado')
      return recurringExpenseService.getRecurringExpenses(user.id, cardId)
    },
    enabled: !!user?.id,
  })
}

export function useCreateRecurringExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RecurringExpenseInsert) =>
      recurringExpenseService.createRecurringExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all })
      toast.success('Assinatura criada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar assinatura. Tente novamente.')
    },
  })
}

export function useUpdateRecurringExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: RecurringExpenseUpdate
    }) => recurringExpenseService.updateRecurringExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all })
      toast.success('Assinatura atualizada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar assinatura. Tente novamente.')
    },
  })
}

export function useToggleRecurringExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      recurringExpenseService.toggleRecurringExpense(id, isActive),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all })
      toast.success(
        variables.isActive ? 'Assinatura ativada!' : 'Assinatura desativada!'
      )
    },
    onError: () => {
      toast.error('Erro ao alterar status da assinatura. Tente novamente.')
    },
  })
}

export function useDeleteRecurringExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      recurringExpenseService.deleteRecurringExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all })
      toast.success('Assinatura excluida com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir assinatura. Tente novamente.')
    },
  })
}
