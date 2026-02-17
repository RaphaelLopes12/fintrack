import { supabase } from '@/lib/supabase'
import type {
  RecurringExpense,
  RecurringExpenseInsert,
  RecurringExpenseUpdate,
} from '@/types'

export const recurringExpenseService = {
  async getRecurringExpenses(
    userId: string,
    cardId?: string
  ): Promise<RecurringExpense[]> {
    let query = supabase
      .from('recurring_expenses')
      .select('*, category:categories(*), credit_card:credit_cards(*)')
      .eq('user_id', userId)
      .order('description', { ascending: true })

    if (cardId) {
      query = query.eq('credit_card_id', cardId)
    }

    const { data, error } = await query

    if (error) throw error
    return data ?? []
  },

  async createRecurringExpense(
    data: RecurringExpenseInsert
  ): Promise<RecurringExpense> {
    const { data: created, error } = await supabase
      .from('recurring_expenses')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return created
  },

  async updateRecurringExpense(
    id: string,
    data: RecurringExpenseUpdate
  ): Promise<RecurringExpense> {
    const { data: updated, error } = await supabase
      .from('recurring_expenses')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  },

  async toggleRecurringExpense(
    id: string,
    isActive: boolean
  ): Promise<RecurringExpense> {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteRecurringExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
