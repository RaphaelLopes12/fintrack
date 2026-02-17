import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CurrencyInput } from '@/components/common/currency-input'
import { CARD_BRANDS } from '@/lib/constants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  useCreateCreditCard,
  useUpdateCreditCard,
} from '@/features/credit-cards/hooks/use-credit-cards'
import { creditCardSchema } from '@/features/credit-cards/schemas/credit-card.schema'
import { cn } from '@/lib/utils'
import type { CreditCardFormData } from '@/features/credit-cards/schemas/credit-card.schema'

const COLOR_PALETTE = [
  '#1e293b',
  '#0f172a',
  '#7c3aed',
  '#2563eb',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
  '#6366f1',
  '#475569',
  '#0d9488',
]

interface CreditCardFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<CreditCardFormData> & { id?: string }
  onSuccess?: () => void
}

export function CreditCardForm({
  open,
  onOpenChange,
  defaultValues,
  onSuccess,
}: CreditCardFormProps) {
  const user = useAuth((state) => state.user)
  const createCard = useCreateCreditCard()
  const updateCard = useUpdateCreditCard()

  const isEditing = !!defaultValues?.id

  const form = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: '',
      last_four_digits: '',
      brand: 'visa',
      card_limit: 0,
      billing_day: 1,
      due_day: 10,
      color: '#1e293b',
      ...defaultValues,
    },
  })

  const isSubmitting = createCard.isPending || updateCard.isPending

  async function handleSubmit(data: CreditCardFormData) {
    if (!user?.id) return

    if (isEditing && defaultValues?.id) {
      await updateCard.mutateAsync({
        id: defaultValues.id,
        data,
      })
    } else {
      await createCard.mutateAsync({
        ...data,
        user_id: user.id,
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
            {isEditing ? 'Editar Cartao' : 'Novo Cartao'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize as informacoes do seu cartao de credito.'
              : 'Adicione um novo cartao de credito para gerenciar suas faturas.'}
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
                  <FormLabel>Nome do Cartao</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nubank, Inter..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last 4 digits */}
            <FormField
              control={form.control}
              name="last_four_digits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ultimos 4 Digitos</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234"
                      maxLength={4}
                      inputMode="numeric"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brand */}
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bandeira</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a bandeira" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CARD_BRANDS.map((brand) => (
                        <SelectItem key={brand.value} value={brand.value}>
                          {brand.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Limit */}
            <FormField
              control={form.control}
              name="card_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite</FormLabel>
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

            {/* Billing day and due day */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billing_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Fechamento</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Vencimento</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Color */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor do Cartao</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            'size-8 rounded-full border-2 transition-transform hover:scale-110',
                            field.value === color
                              ? 'border-foreground scale-110'
                              : 'border-transparent'
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

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? 'Atualizar Cartao' : 'Criar Cartao'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
