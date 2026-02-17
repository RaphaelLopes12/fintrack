import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { dashboardService } from '@/features/dashboard/services/dashboard.service'

export function useMonthlySummary(month: number, year: number) {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: ['dashboard', 'summary', month, year],
    queryFn: () => {
      if (!user?.id) throw new Error('Usuario nao autenticado')
      return dashboardService.getMonthlySummary(user.id, month, year)
    },
    enabled: !!user?.id,
  })
}

export function useCategoryBreakdown(month: number, year: number) {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: ['dashboard', 'category-breakdown', month, year],
    queryFn: () => {
      if (!user?.id) throw new Error('Usuario nao autenticado')
      return dashboardService.getCategoryBreakdown(user.id, month, year)
    },
    enabled: !!user?.id,
  })
}

export function useRecentTransactions(limit: number = 5) {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: ['dashboard', 'recent-transactions', limit],
    queryFn: () => {
      if (!user?.id) throw new Error('Usuario nao autenticado')
      return dashboardService.getRecentTransactions(user.id, limit)
    },
    enabled: !!user?.id,
  })
}

export function useUpcomingInvoices() {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: ['dashboard', 'upcoming-invoices'],
    queryFn: () => {
      if (!user?.id) throw new Error('Usuario nao autenticado')
      return dashboardService.getUpcomingInvoices(user.id)
    },
    enabled: !!user?.id,
  })
}

export function useMonthlyTrend(months: number = 6) {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: ['dashboard', 'monthly-trend', months],
    queryFn: () => {
      if (!user?.id) throw new Error('Usuario nao autenticado')
      return dashboardService.getMonthlyTrend(user.id, months)
    },
    enabled: !!user?.id,
  })
}
