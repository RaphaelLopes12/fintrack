import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { dashboardService } from '@/features/dashboard/services/dashboard.service'
import { useActiveUserId } from '@/features/sharing/hooks/use-shared-context'

export function useMonthlySummary(month: number, year: number) {
  const activeUserId = useActiveUserId()

  return useQuery({
    queryKey: ['dashboard', 'summary', activeUserId, month, year],
    queryFn: () => {
      if (!activeUserId) throw new Error('Usuário não autenticado')
      return dashboardService.getMonthlySummary(activeUserId, month, year)
    },
    enabled: !!activeUserId,
  })
}

export function useCategoryBreakdown(month: number, year: number) {
  const activeUserId = useActiveUserId()

  return useQuery({
    queryKey: ['dashboard', 'category-breakdown', activeUserId, month, year],
    queryFn: () => {
      if (!activeUserId) throw new Error('Usuário não autenticado')
      return dashboardService.getCategoryBreakdown(activeUserId, month, year)
    },
    enabled: !!activeUserId,
  })
}

export function useRecentTransactions(limit: number = 5) {
  const activeUserId = useActiveUserId()

  return useQuery({
    queryKey: ['dashboard', 'recent-transactions', activeUserId, limit],
    queryFn: () => {
      if (!activeUserId) throw new Error('Usuário não autenticado')
      return dashboardService.getRecentTransactions(activeUserId, limit)
    },
    enabled: !!activeUserId,
  })
}

export function useUpcomingInvoices() {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: ['dashboard', 'upcoming-invoices'],
    queryFn: () => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      return dashboardService.getUpcomingInvoices()
    },
    enabled: !!user?.id,
  })
}

export function useMonthlyTrend(months: number = 6) {
  const activeUserId = useActiveUserId()

  return useQuery({
    queryKey: ['dashboard', 'monthly-trend', activeUserId, months],
    queryFn: () => {
      if (!activeUserId) throw new Error('Usuário não autenticado')
      return dashboardService.getMonthlyTrend(activeUserId, months)
    },
    enabled: !!activeUserId,
  })
}
