import type { Database } from './supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type CreditCard = Database['public']['Tables']['credit_cards']['Row']
export type CreditCardInsert = Database['public']['Tables']['credit_cards']['Insert']
export type CreditCardUpdate = Database['public']['Tables']['credit_cards']['Update']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export type CreditCardInvoice = Database['public']['Tables']['credit_card_invoices']['Row']
export type CreditCardInvoiceInsert = Database['public']['Tables']['credit_card_invoices']['Insert']
export type CreditCardInvoiceUpdate = Database['public']['Tables']['credit_card_invoices']['Update']

export type RecurringExpense = Database['public']['Tables']['recurring_expenses']['Row']
export type RecurringExpenseInsert = Database['public']['Tables']['recurring_expenses']['Insert']
export type RecurringExpenseUpdate = Database['public']['Tables']['recurring_expenses']['Update']

export type SharedAccess = Database['public']['Tables']['shared_access']['Row']
export type SharedAccessInsert = Database['public']['Tables']['shared_access']['Insert']
export type SharedAccessUpdate = Database['public']['Tables']['shared_access']['Update']

export type TransactionWithCategory = Transaction & {
  category: Category
}

export type CreditCardWithInvoices = CreditCard & {
  invoices: CreditCardInvoice[]
}
