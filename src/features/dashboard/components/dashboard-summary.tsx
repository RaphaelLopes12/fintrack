import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight } from 'lucide-react'
import { StatCard } from '@/components/common/stat-card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format'
import { useMonthlySummary } from '@/features/dashboard/hooks/use-dashboard-data'

interface DashboardSummaryProps {
  month: number
  year: number
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[88px] rounded-xl" />
      ))}
    </div>
  )
}

export function DashboardSummary({ month, year }: DashboardSummaryProps) {
  const { data: summary, isLoading } = useMonthlySummary(month, year)

  if (isLoading) {
    return <SummarySkeleton />
  }

  const totalIncome = summary?.total_income ?? 0
  const totalExpenses = summary?.total_expenses ?? 0
  const balance = summary?.balance ?? 0
  const transactionCount = summary?.transaction_count ?? 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Receitas"
        value={formatCurrency(totalIncome)}
        icon={TrendingUp}
        className="border-l-4 border-l-emerald-500"
      />
      <StatCard
        title="Despesas"
        value={formatCurrency(totalExpenses)}
        icon={TrendingDown}
        className="border-l-4 border-l-red-500"
      />
      <StatCard
        title="Saldo"
        value={formatCurrency(balance)}
        icon={Wallet}
        className="border-l-4 border-l-violet-500"
      />
      <StatCard
        title="Transacoes"
        value={String(transactionCount)}
        icon={ArrowLeftRight}
        className="border-l-4 border-l-orange-500"
      />
    </div>
  )
}
