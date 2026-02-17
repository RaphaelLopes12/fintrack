import { supabase } from '@/lib/supabase'
import type { TransactionInsert, TransactionUpdate, TransactionWithCategory } from '@/types'

export interface TransactionFilters {
  month?: number
  year?: number
  categoryId?: string
  type?: 'income' | 'expense'
  search?: string
  limit?: number
  offset?: number
}

export const transactionService = {
  async getTransactions(
    userId: string,
    filters: TransactionFilters = {}
  ): Promise<TransactionWithCategory[]> {
    let query = supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters.month && filters.year) {
      const startDate = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`
      const lastDay = new Date(filters.year, filters.month, 0).getDate()
      const endDate = `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      query = query.gte('date', startDate).lte('date', endDate)
    }

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.search) {
      query = query.ilike('description', `%${filters.search}%`)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit ?? 50) - 1
      )
    }

    const { data, error } = await query

    if (error) throw error

    return (data ?? []).map((item) => ({
      ...item,
      category: item.category as unknown as TransactionWithCategory['category'],
    }))
  },

  async getTransactionById(id: string): Promise<TransactionWithCategory> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      ...data,
      category: data.category as unknown as TransactionWithCategory['category'],
    }
  },

  async createTransaction(data: TransactionInsert): Promise<TransactionWithCategory> {
    const { data: created, error } = await supabase
      .from('transactions')
      .insert(data)
      .select('*, category:categories(*)')
      .single()

    if (error) throw error

    return {
      ...created,
      category: created.category as unknown as TransactionWithCategory['category'],
    }
  },

  async updateTransaction(
    id: string,
    data: TransactionUpdate
  ): Promise<TransactionWithCategory> {
    const { data: updated, error } = await supabase
      .from('transactions')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, category:categories(*)')
      .single()

    if (error) throw error

    return {
      ...updated,
      category: updated.category as unknown as TransactionWithCategory['category'],
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async deleteImportedTransactions(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .like('notes', 'Importado%')
      .select('id')

    if (error) throw error
    return data?.length ?? 0
  },

  async bulkCreateTransactions(
    data: TransactionInsert[]
  ): Promise<{ created: number; errors: string[] }> {
    const CHUNK_SIZE = 100
    let created = 0
    const errors: string[] = []

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE)

      const { data: result, error } = await supabase
        .from('transactions')
        .insert(chunk)
        .select('id')

      if (error) {
        errors.push(`Erro ao importar lote ${Math.floor(i / CHUNK_SIZE) + 1}: ${error.message}`)
      } else {
        created += result?.length ?? 0
      }
    }

    return { created, errors }
  },
}
