import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { categoryService } from '@/features/transactions/services/category.service'
import { useActiveUserId } from '@/features/sharing/hooks/use-shared-context'
import type { CategoryInsert, CategoryUpdate } from '@/types'

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (type?: 'income' | 'expense') =>
    [...categoryKeys.lists(), { type }] as const,
}

export function useCategories(type?: 'income' | 'expense') {
  const activeUserId = useActiveUserId()

  return useQuery({
    queryKey: [...categoryKeys.list(type), activeUserId],
    queryFn: () => {
      if (!activeUserId) throw new Error('Usuário não autenticado')
      return categoryService.getCategories(activeUserId, type)
    },
    enabled: !!activeUserId,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CategoryInsert) =>
      categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Categoria criada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar categoria. Tente novamente.')
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdate }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Categoria atualizada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar categoria. Tente novamente.')
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Categoria excluída com sucesso!')
    },
    onError: (error) => {
      const message =
        error instanceof Error && error.message.includes('foreign key')
          ? 'Esta categoria possui transacoes vinculadas e não pode ser excluída.'
          : 'Erro ao excluir categoria. Tente novamente.'
      toast.error(message)
    },
  })
}
