import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CalendarIcon,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  StickyNote,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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
import { useCategories } from '@/features/transactions/hooks/use-categories'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { transactionSchema } from '@/features/transactions/schemas/transaction.schema'
import { FREQUENCIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import type { TransactionFormData } from '@/features/transactions/schemas/transaction.schema'
import type { CreditCard } from '@/types'

interface TransactionFormProps {
  defaultValues?: Partial<TransactionFormData>
  onSubmit: (data: TransactionFormData) => void
  isSubmitting: boolean
}

export function TransactionForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: TransactionFormProps) {
  const user = useAuth((state) => state.user)

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      description: '',
      category_id: '',
      credit_card_id: null,
      date: new Date(),
      is_recurring: false,
      recurring_frequency: null,
      notes: '',
      ...defaultValues,
    },
  })

  const watchType = form.watch('type')
  const watchIsRecurring = form.watch('is_recurring')

  const { data: categories = [] } = useCategories(watchType)

  const { data: creditCards = [] } = useQuery({
    queryKey: ['credit-cards', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Usuario nao autenticado')
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      return data as CreditCard[]
    },
    enabled: !!user?.id,
  })

  // Reset category when type changes (unless editing)
  useEffect(() => {
    if (!defaultValues?.category_id) {
      form.setValue('category_id', '')
    }
    if (watchType === 'income') {
      form.setValue('credit_card_id', null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchType])

  // Clear frequency when recurring is disabled
  useEffect(() => {
    if (!watchIsRecurring) {
      form.setValue('recurring_frequency', null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchIsRecurring])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Type toggle */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={field.value === 'income' ? 'default' : 'outline'}
                    className={cn(
                      'flex-1',
                      field.value === 'income' &&
                        'bg-emerald-600 hover:bg-emerald-700'
                    )}
                    onClick={() => field.onChange('income')}
                  >
                    <ArrowUpCircle className="size-4" />
                    Receita
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === 'expense' ? 'default' : 'outline'}
                    className={cn(
                      'flex-1',
                      field.value === 'expense' &&
                        'bg-red-600 hover:bg-red-700'
                    )}
                    onClick={() => field.onChange('expense')}
                  >
                    <ArrowDownCircle className="size-4" />
                    Despesa
                  </Button>
                </div>
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

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descricao</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Supermercado, Salario..." {...field} />
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

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
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
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ?? new Date())}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Credit Card (expense only) */}
        {watchType === 'expense' && (
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
        )}

        {/* Recurring */}
        <FormField
          control={form.control}
          name="is_recurring"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Recorrente</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Esta transacao se repete periodicamente?
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Recurring Frequency */}
        {watchIsRecurring && (
          <FormField
            control={form.control}
            name="recurring_frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequencia</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? undefined}
                >
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
        )}

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <StickyNote className="inline size-4" /> Observacoes (opcional)
              </FormLabel>
              <FormControl>
                <textarea
                  className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Adicione observacoes sobre esta transacao..."
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {defaultValues ? 'Atualizar Transacao' : 'Criar Transacao'}
        </Button>
      </form>
    </Form>
  )
}
