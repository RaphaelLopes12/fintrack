import { supabase } from '@/lib/supabase'
import type { CreditCard, CreditCardInsert, CreditCardUpdate } from '@/types'

export const creditCardService = {
  async getCreditCards(userId: string): Promise<CreditCard[]> {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return data ?? []
  },

  async getCreditCardById(id: string): Promise<CreditCard> {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createCreditCard(data: CreditCardInsert): Promise<CreditCard> {
    const { data: created, error } = await supabase
      .from('credit_cards')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return created
  },

  async updateCreditCard(
    id: string,
    data: CreditCardUpdate
  ): Promise<CreditCard> {
    const { data: updated, error } = await supabase
      .from('credit_cards')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  },

  async deleteCreditCard(id: string): Promise<void> {
    const { error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
