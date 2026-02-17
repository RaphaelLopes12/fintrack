import { supabase } from '@/lib/supabase'
import { getBillingPeriod, getInvoiceDueDate } from '@/lib/date'
import { format } from 'date-fns'
import type {
  CreditCardInvoice,
  TransactionWithCategory,
} from '@/types'

export const invoiceService = {
  async getInvoicesByCard(
    cardId: string,
    year?: number
  ): Promise<CreditCardInvoice[]> {
    let query = supabase
      .from('credit_card_invoices')
      .select('*')
      .eq('credit_card_id', cardId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (year) {
      query = query.eq('year', year)
    }

    const { data, error } = await query

    if (error) throw error
    return data ?? []
  },

  async getInvoiceDetail(invoiceId: string): Promise<CreditCardInvoice> {
    const { data, error } = await supabase
      .from('credit_card_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (error) throw error
    return data
  },

  async getInvoiceTransactions(
    cardId: string,
    month: number,
    year: number,
    billingDay: number
  ): Promise<TransactionWithCategory[]> {
    const { start, end } = getBillingPeriod(billingDay, month, year)
    const startDate = format(start, 'yyyy-MM-dd')
    const endDate = format(end, 'yyyy-MM-dd')

    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('credit_card_id', cardId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) throw error

    return (data ?? []).map((item) => ({
      ...item,
      category: item.category as unknown as TransactionWithCategory['category'],
    }))
  },

  async createOrGetInvoice(
    cardId: string,
    month: number,
    year: number,
    dueDay: number
  ): Promise<CreditCardInvoice> {
    const { data: existing, error: findError } = await supabase
      .from('credit_card_invoices')
      .select('*')
      .eq('credit_card_id', cardId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle()

    if (findError) throw findError

    if (existing) return existing

    const dueDate = getInvoiceDueDate(dueDay, month, year)

    const { data: created, error: createError } = await supabase
      .from('credit_card_invoices')
      .insert({
        credit_card_id: cardId,
        month,
        year,
        due_date: format(dueDate, 'yyyy-MM-dd'),
        total_amount: 0,
      })
      .select()
      .single()

    if (createError) throw createError
    return created
  },

  async markInvoicePaid(invoiceId: string): Promise<CreditCardInvoice> {
    const { data, error } = await supabase
      .from('credit_card_invoices')
      .update({
        is_paid: true,
        paid_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async markInvoiceUnpaid(invoiceId: string): Promise<CreditCardInvoice> {
    const { data, error } = await supabase
      .from('credit_card_invoices')
      .update({
        is_paid: false,
        paid_at: null,
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async recalculateInvoiceTotal(
    invoiceId: string,
    cardId: string,
    month: number,
    year: number,
    billingDay: number
  ): Promise<CreditCardInvoice> {
    const { start, end } = getBillingPeriod(billingDay, month, year)
    const startDate = format(start, 'yyyy-MM-dd')
    const endDate = format(end, 'yyyy-MM-dd')

    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('credit_card_id', cardId)
      .gte('date', startDate)
      .lte('date', endDate)

    if (txError) throw txError

    const total = (transactions ?? []).reduce(
      (sum, tx) => sum + tx.amount,
      0
    )

    const { data, error } = await supabase
      .from('credit_card_invoices')
      .update({ total_amount: total })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
