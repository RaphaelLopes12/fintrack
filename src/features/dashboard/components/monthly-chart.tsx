import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format'
import { useMonthlyTrend } from '@/features/dashboard/hooks/use-dashboard-data'

interface MonthlyChartProps {
  month: number
  year: number
}

const chartConfig = {
  income: {
    label: 'Receitas',
    color: '#10b981',
  },
  expenses: {
    label: 'Despesas',
    color: '#ef4444',
  },
} satisfies ChartConfig

export function MonthlyChart(_props: MonthlyChartProps) {
  const { data: trend, isLoading } = useMonthlyTrend(6)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolucao Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolucao Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={trend ?? []} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => formatCurrency(value)}
              width={100}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    formatCurrency(value as number)
                  }
                />
              }
            />
            <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
