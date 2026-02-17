import {
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  setDate,
  format,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function getMonthRange(month: number, year: number) {
  const date = new Date(year, month - 1, 1)
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

export function getMonthName(month: number, year: number): string {
  const date = new Date(year, month - 1, 1)
  return format(date, 'MMMM yyyy', { locale: ptBR })
}

export function getPreviousMonth(month: number, year: number) {
  const date = subMonths(new Date(year, month - 1, 1), 1)
  return { month: date.getMonth() + 1, year: date.getFullYear() }
}

export function getNextMonth(month: number, year: number) {
  const date = addMonths(new Date(year, month - 1, 1), 1)
  return { month: date.getMonth() + 1, year: date.getFullYear() }
}

export function getInvoiceDueDate(
  dueDay: number,
  month: number,
  year: number
): Date {
  const date = new Date(year, month - 1, 1)
  const lastDay = endOfMonth(date).getDate()
  const actualDay = Math.min(dueDay, lastDay)
  return setDate(date, actualDay)
}

export function getBillingPeriod(
  billingDay: number,
  invoiceMonth: number,
  invoiceYear: number
) {
  const periodEnd = new Date(invoiceYear, invoiceMonth - 1, billingDay)
  const periodStart = subMonths(periodEnd, 1)
  periodStart.setDate(periodStart.getDate() + 1)
  return { start: periodStart, end: periodEnd }
}
