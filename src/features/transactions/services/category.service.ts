import { supabase } from '@/lib/supabase'
import type { Category, CategoryInsert, CategoryUpdate } from '@/types'

export const categoryService = {
  async getCategories(
    userId: string,
    type?: 'income' | 'expense'
  ): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error) throw error
    return data ?? []
  },

  async createCategory(data: CategoryInsert): Promise<Category> {
    const { data: created, error } = await supabase
      .from('categories')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return created
  },

  async updateCategory(id: string, data: CategoryUpdate): Promise<Category> {
    const { data: updated, error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getCategoryUsageCount(id: string): Promise<number> {
    const { count, error } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (error) throw error
    return count ?? 0
  },
}
