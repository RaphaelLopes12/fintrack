import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  transactionService,
  type TransactionFilters,
} from '@/features/transactions/services/transaction.service'
import { useActiveUserId } from '@/features/sharing/hooks/use-shared-context'
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
  const activeUserId = useActiveUserId()

  return useQuery({
    queryKey: [...transactionKeys.list(filters), activeUserId],
    queryFn: () => {
      if (!activeUserId) throw new Error('Usuário não autenticado')
      return transactionService.getTransactions(activeUserId, filters)
    },
    enabled: !!activeUserId,
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
      toast.success('Transação criada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar transação. Tente novamente.')
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
      toast.success('Transação atualizada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar transação. Tente novamente.')
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
      toast.success('Transação excluída com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir transação. Tente novamente.')
    },
  })
}
