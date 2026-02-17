import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  transactionService,
  type TransactionFilters,
} from '@/features/transactions/services/transaction.service'
import type { TransactionInsert, TransactionUpdate } from '@/types'

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: TransactionFilters) =>
    [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
}

export function useTransactions(filters: TransactionFilters = {}) {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => {
      if (!user?.id) throw new Error('Usuario nao autenticado')
      return transactionService.getTransactions(user.id, filters)
    },
    enabled: !!user?.id,
  })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionService.getTransactionById(id),
    enabled: !!id,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TransactionInsert) =>
      transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transacao criada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar transacao. Tente novamente.')
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionUpdate }) =>
      transactionService.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transacao atualizada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar transacao. Tente novamente.')
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transacao excluida com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir transacao. Tente novamente.')
    },
  })
}
