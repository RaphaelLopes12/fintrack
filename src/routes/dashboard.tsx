import { useState } from 'react'
import { PageHeader } from '@/components/common/page-header'
import { MonthSelector } from '@/features/dashboard/components/month-selector'
import { DashboardSummary } from '@/features/dashboard/components/dashboard-summary'
import { MonthlyChart } from '@/features/dashboard/components/monthly-chart'
import { CategoryBreakdown } from '@/features/dashboard/components/category-breakdown'
import { RecentTransactions } from '@/features/dashboard/components/recent-transactions'
import { UpcomingInvoices } from '@/features/dashboard/components/upcoming-invoices'
import { getCurrentMonth, getCurrentYear } from '@/lib/date'

function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())

  function handleMonthChange(month: number, year: number) {
    setSelectedMonth(month)
    setSelectedYear(year)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visao geral das suas financas"
      >
        <MonthSelector
          month={selectedMonth}
          year={selectedYear}
          onChange={handleMonthChange}
        />
      </PageHeader>

      <DashboardSummary month={selectedMonth} year={selectedYear} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyChart month={selectedMonth} year={selectedYear} />
        <CategoryBreakdown month={selectedMonth} year={selectedYear} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentTransactions />
        <UpcomingInvoices />
      </div>
    </div>
  )
}

export default DashboardPage
export { DashboardPage as Component }
