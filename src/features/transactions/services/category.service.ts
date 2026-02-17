import { supabase } from '@/lib/supabase'
import { DEFAULT_CATEGORIES } from '@/lib/constants'
import type { Category, CategoryInsert, CategoryUpdate } from '@/types'

export const categoryService = {
  async seedDefaultCategories(userId: string): Promise<Category[]> {
    const inserts: CategoryInsert[] = [
      ...DEFAULT_CATEGORIES.income.map((c) => ({
        user_id: userId,
        name: c.name,
        type: 'income' as const,
        icon: c.icon,
        color: c.color,
      })),
      ...DEFAULT_CATEGORIES.expense.map((c) => ({
        user_id: userId,
        name: c.name,
        type: 'expense' as const,
        icon: c.icon,
        color: c.color,
      })),
    ]

    const { data, error } = await supabase
      .from('categories')
      .insert(inserts)
      .select()

    if (error) throw error
    return data ?? []
  },

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
