import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { TRANSACTION_TYPES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { categorySchema } from '@/features/transactions/schemas/category.schema'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  useCreateCategory,
  useUpdateCategory,
} from '@/features/transactions/hooks/use-categories'
import type { CategoryFormData } from '@/features/transactions/schemas/category.schema'

const ICON_OPTIONS = [
  'banknote',
  'laptop',
  'trending-up',
  'gift',
  'utensils',
  'car',
  'home',
  'heart-pulse',
  'graduation-cap',
  'gamepad-2',
  'shirt',
  'repeat',
  'file-text',
  'circle',
  'shopping-cart',
  'plane',
  'music',
  'book',
  'coffee',
  'smartphone',
  'briefcase',
  'wrench',
  'zap',
  'star',
] as const

const COLOR_OPTIONS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
  '#14b8a6',
  '#84cc16',
] as const

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: CategoryFormData & { id?: string }
  onSuccess?: () => void
}

export function CategoryForm({
  open,
  onOpenChange,
  defaultValues,
  onSuccess,
}: CategoryFormProps) {
  const user = useAuth((state) => state.user)
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const isEditing = !!defaultValues?.id

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      icon: 'circle',
      color: '#3b82f6',
      ...defaultValues,
    },
  })

  async function handleSubmit(data: CategoryFormData) {
    if (!user?.id) return

    try {
      if (isEditing && defaultValues?.id) {
        await updateCategory.mutateAsync({
          id: defaultValues.id,
          data,
        })
      } else {
        await createCategory.mutateAsync({
          ...data,
          user_id: user.id,
        })
      }

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // Error handled by mutation onError
    }
  }

  const isSubmitting = createCategory.isPending || updateCategory.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados da categoria.'
              : 'Crie uma nova categoria para suas transações.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da categoria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Icon picker */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-6 gap-2">
                      {ICON_OPTIONS.map((icon) => (
                        <Button
                          key={icon}
                          type="button"
                          variant={field.value === icon ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            'h-9 text-xs',
                            field.value === icon && 'ring-2 ring-primary'
                          )}
                          onClick={() => field.onChange(icon)}
                          title={icon}
                        >
                          {icon
                            .split('-')
                            .map((w) => w.charAt(0).toUpperCase())
                            .join('')
                            .slice(0, 2)}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Selecionado: {field.value}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color picker */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            'size-8 rounded-full transition-all',
                            field.value === color
                              ? 'ring-2 ring-primary ring-offset-2'
                              : 'hover:scale-110'
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? 'Atualizar' : 'Criar Categoria'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
