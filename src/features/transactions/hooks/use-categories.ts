import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { categoryService } from '@/features/transactions/services/category.service'
import type { CategoryInsert, CategoryUpdate } from '@/types'

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (type?: 'income' | 'expense') =>
    [...categoryKeys.lists(), { type }] as const,
}

export function useCategories(type?: 'income' | 'expense') {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: categoryKeys.list(type),
    queryFn: () => {
      if (!user?.id) throw new Error('Usuario nao autenticado')
      return categoryService.getCategories(user.id, type)
    },
    enabled: !!user?.id,
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
      toast.success('Categoria excluida com sucesso!')
    },
    onError: (error) => {
      const message =
        error instanceof Error && error.message.includes('foreign key')
          ? 'Esta categoria possui transacoes vinculadas e nao pode ser excluida.'
          : 'Erro ao excluir categoria. Tente novamente.'
      toast.error(message)
    },
  })
}
