import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CurrencyInput } from '@/components/common/currency-input'
import { FREQUENCIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCategories } from '@/features/transactions/hooks/use-categories'
import { useCreditCards } from '@/features/credit-cards/hooks/use-credit-cards'
import {
  useCreateRecurringExpense,
  useUpdateRecurringExpense,
} from '@/features/credit-cards/hooks/use-recurring-expenses'
import { recurringExpenseSchema } from '@/features/credit-cards/schemas/recurring-expense.schema'
import type { RecurringExpenseFormData } from '@/features/credit-cards/schemas/recurring-expense.schema'

interface RecurringExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<RecurringExpenseFormData> & { id?: string }
  creditCardId?: string
  onSuccess?: () => void
}

export function RecurringExpenseForm({
  open,
  onOpenChange,
  defaultValues,
  creditCardId,
  onSuccess,
}: RecurringExpenseFormProps) {
  const user = useAuth((state) => state.user)
  const { data: categories = [] } = useCategories('expense')
  const { data: creditCards = [] } = useCreditCards()

  const createExpense = useCreateRecurringExpense()
  const updateExpense = useUpdateRecurringExpense()

  const isEditing = !!defaultValues?.id

  const form = useForm<RecurringExpenseFormData>({
    resolver: zodResolver(recurringExpenseSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category_id: '',
      credit_card_id: creditCardId ?? null,
      frequency: 'monthly',
      start_date: new Date(),
      end_date: null,
      ...defaultValues,
    },
  })

  const isSubmitting = createExpense.isPending || updateExpense.isPending

  async function handleSubmit(data: RecurringExpenseFormData) {
    if (!user?.id) return

    const startDateStr =
      data.start_date instanceof Date
        ? format(data.start_date, 'yyyy-MM-dd')
        : data.start_date
    const endDateStr =
      data.end_date instanceof Date
        ? format(data.end_date, 'yyyy-MM-dd')
        : data.end_date ?? null

    if (isEditing && defaultValues?.id) {
      await updateExpense.mutateAsync({
        id: defaultValues.id,
        data: {
          description: data.description,
          amount: data.amount,
          category_id: data.category_id,
          credit_card_id: data.credit_card_id,
          frequency: data.frequency,
          start_date: startDateStr,
          end_date: endDateStr,
        },
      })
    } else {
      await createExpense.mutateAsync({
        user_id: user.id,
        description: data.description,
        amount: data.amount,
        category_id: data.category_id,
        credit_card_id: data.credit_card_id,
        frequency: data.frequency,
        start_date: startDateStr,
        end_date: endDateStr,
      })
    }

    form.reset()
    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Assinatura' : 'Nova Assinatura'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informacoes da assinatura.'
              : 'Adicione uma nova assinatura ou despesa recorrente.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descricao</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Netflix, Spotify..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="R$ 0,00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className="size-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Credit Card */}
            <FormField
              control={form.control}
              name="credit_card_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cartao de Credito (opcional)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === '__none__' ? null : value)
                    }
                    value={field.value ?? '__none__'}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Nenhum cartao" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">Nenhum cartao</SelectItem>
                      {creditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className="size-3 rounded-full"
                              style={{ backgroundColor: card.color }}
                            />
                            {card.name} (*{card.last_four_digits})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Frequency */}
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequencia</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a frequencia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Inicio</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? format(new Date(field.value), 'dd/MM/yyyy', {
                                locale: ptBR,
                              })
                            : 'Selecione uma data'}
                          <CalendarIcon className="ml-auto size-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => field.onChange(date ?? new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date */}
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Fim (opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? format(new Date(field.value), 'dd/MM/yyyy', {
                                locale: ptBR,
                              })
                            : 'Sem data de fim'}
                          <CalendarIcon className="ml-auto size-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => field.onChange(date ?? null)}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? 'Atualizar Assinatura' : 'Criar Assinatura'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
