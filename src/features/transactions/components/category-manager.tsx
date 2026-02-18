import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useCategories,
  useDeleteCategory,
} from '@/features/transactions/hooks/use-categories'
import { useCanEdit } from '@/features/sharing/hooks/use-shared-context'
import { categoryService } from '@/features/transactions/services/category.service'
import { CategoryForm } from '@/features/transactions/components/category-form'
import type { CategoryFormData } from '@/features/transactions/schemas/category.schema'
import type { Category } from '@/types'

export function CategoryManager() {
  const canEdit = useCanEdit()
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<
    (CategoryFormData & { id: string }) | undefined
  >(undefined)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [usageCount, setUsageCount] = useState<number | null>(null)

  const { data: incomeCategories = [], isLoading: loadingIncome } =
    useCategories('income')
  const { data: expenseCategories = [], isLoading: loadingExpense } =
    useCategories('expense')
  const deleteCategory = useDeleteCategory()

  function handleEdit(category: Category) {
    setEditingCategory({
      id: category.id,
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    })
    setFormOpen(true)
  }

  async function handleDeleteClick(category: Category) {
    const count = await categoryService.getCategoryUsageCount(category.id)
    setUsageCount(count)
    setDeleteTarget(category)
  }

  function handleConfirmDelete() {
    if (deleteTarget && usageCount === 0) {
      deleteCategory.mutate(deleteTarget.id)
    }
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) {
      setEditingCategory(undefined)
    }
  }

  function handleAddNew() {
    setEditingCategory(undefined)
    setFormOpen(true)
  }

  const isLoading = loadingIncome || loadingExpense

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  function renderCategoryGrid(categories: Category[]) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between rounded-lg border bg-card p-3"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className="size-4 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="truncate text-sm font-medium">
                {category.name}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              {category.is_default && (
                <Badge variant="secondary" className="mr-1 text-[10px]">
                  Padrão
                </Badge>
              )}
              {canEdit && (
                <>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDeleteClick(category)}
                  >
                    <Trash2 className="size-3 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Categorias</CardTitle>
          {canEdit && (
            <Button size="sm" onClick={handleAddNew}>
              <Plus className="size-4" />
              Adicionar Categoria
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="expense">
            <TabsList className="mb-4">
              <TabsTrigger value="expense">
                Despesas ({expenseCategories.length})
              </TabsTrigger>
              <TabsTrigger value="income">
                Receitas ({incomeCategories.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="expense">
              {renderCategoryGrid(expenseCategories)}
            </TabsContent>
            <TabsContent value="income">
              {renderCategoryGrid(incomeCategories)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CategoryForm
        open={formOpen}
        onOpenChange={handleFormClose}
        defaultValues={editingCategory}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setUsageCount(null)
          }
        }}
        title="Excluir Categoria"
        description={
          usageCount && usageCount > 0
            ? `Esta categoria possui ${usageCount} transação(ões) vinculada(s) e não pode ser excluída. Remova ou altere as transações antes.`
            : 'Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.'
        }
        onConfirm={handleConfirmDelete}
        confirmText={usageCount && usageCount > 0 ? 'Entendido' : 'Excluir'}
        cancelText="Cancelar"
        variant={usageCount && usageCount > 0 ? 'default' : 'destructive'}
      />
    </>
  )
}
