import { supabase } from '@/lib/supabase'
import { subMonths, format } from 'date-fns'

export interface MonthlySummary {
  total_income: number
  total_expenses: number
  balance: number
  transaction_count: number
}

export interface CategoryBreakdownItem {
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  total: number
  percentage: number
}

export interface RecentTransaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  category: {
    id: string
    name: string
    icon: string
    color: string
  }
}

export interface UpcomingInvoice {
  id: string
  month: number
  year: number
  total_amount: number
  due_date: string
  is_paid: boolean
  credit_card: {
    id: string
    name: string
    brand: string
    last_four_digits: string
    color: string
  }
}

export interface MonthlyTrendItem {
  month: number
  year: number
  label: string
  income: number
  expenses: number
}

export const dashboardService = {
  async getMonthlySummary(
    userId: string,
    month: number,
    year: number
  ): Promise<MonthlySummary> {
    const { data, error } = await supabase.rpc('get_monthly_summary', {
      p_user_id: userId,
      p_month: month,
      p_year: year,
    })

    if (error) throw error

    const result = data?.[0] ?? {
      total_income: 0,
      total_expenses: 0,
      balance: 0,
      transaction_count: 0,
    }

    return result
  },

  async getCategoryBreakdown(
    userId: string,
    month: number,
    year: number,
    type: string = 'expense'
  ): Promise<CategoryBreakdownItem[]> {
    const { data, error } = await supabase.rpc('get_category_breakdown', {
      p_user_id: userId,
      p_month: month,
      p_year: year,
      p_type: type,
    })

    if (error) throw error
    return data ?? []
  },

  async getRecentTransactions(
    userId: string,
    limit: number = 5
  ): Promise<RecentTransaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(
        `
        id,
        type,
        amount,
        description,
        date,
        category:categories (
          id,
          name,
          icon,
          color
        )
      `
      )
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      amount: item.amount,
      description: item.description,
      date: item.date,
      category: item.category as unknown as RecentTransaction['category'],
    }))
  },

  async getUpcomingInvoices(): Promise<UpcomingInvoice[]> {
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    const todayStr = format(today, 'yyyy-MM-dd')
    const futureStr = format(thirtyDaysFromNow, 'yyyy-MM-dd')

    const { data, error } = await supabase
      .from('credit_card_invoices')
      .select(
        `
        id,
        month,
        year,
        total_amount,
        due_date,
        is_paid,
        credit_card:credit_cards (
          id,
          name,
          brand,
          last_four_digits,
          color
        )
      `
      )
      .eq('is_paid', false)
      .gte('due_date', todayStr)
      .lte('due_date', futureStr)
      .order('due_date', { ascending: true })

    if (error) throw error

    // Filter by user through credit card ownership
    const filtered = (data ?? []).filter((item) => {
      const card = item.credit_card as unknown as { id: string } | null
      return card !== null
    })

    return filtered.map((item) => ({
      id: item.id,
      month: item.month,
      year: item.year,
      total_amount: item.total_amount,
      due_date: item.due_date,
      is_paid: item.is_paid,
      credit_card: item.credit_card as unknown as UpcomingInvoice['credit_card'],
    }))
  },

  async getMonthlyTrend(
    userId: string,
    months: number = 6
  ): Promise<MonthlyTrendItem[]> {
    const now = new Date()
    const startDate = subMonths(now, months - 1)
    const startStr = format(startDate, 'yyyy-MM-01')

    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount, date')
      .eq('user_id', userId)
      .gte('date', startStr)
      .order('date', { ascending: true })

    if (error) throw error

    const grouped = new Map<string, { income: number; expenses: number }>()

    // Initialize all months
    for (let i = 0; i < months; i++) {
      const d = subMonths(now, months - 1 - i)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      grouped.set(key, { income: 0, expenses: 0 })
    }

    // Aggregate transactions
    for (const tx of data ?? []) {
      const txDate = new Date(tx.date)
      const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`
      const entry = grouped.get(key)
      if (entry) {
        if (tx.type === 'income') {
          entry.income += tx.amount
        } else {
          entry.expenses += tx.amount
        }
      }
    }

    const monthAbbreviations: Record<number, string> = {
      1: 'Jan',
      2: 'Fev',
      3: 'Mar',
      4: 'Abr',
      5: 'Mai',
      6: 'Jun',
      7: 'Jul',
      8: 'Ago',
      9: 'Set',
      10: 'Out',
      11: 'Nov',
      12: 'Dez',
    }

    const result: MonthlyTrendItem[] = []
    for (const [key, values] of grouped) {
      const [yearStr, monthStr] = key.split('-')
      const month = parseInt(monthStr, 10)
      const year = parseInt(yearStr, 10)
      result.push({
        month,
        year,
        label: monthAbbreviations[month] ?? '',
        income: values.income,
        expenses: values.expenses,
      })
    }

    return result
  },
}
