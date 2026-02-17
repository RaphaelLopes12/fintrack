import { PieChart, Pie, Cell } from 'recharts'
import { PieChartIcon } from 'lucide-react'
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
import { EmptyState } from '@/components/common/empty-state'
import { formatCurrency } from '@/lib/format'
import { useCategoryBreakdown } from '@/features/dashboard/hooks/use-dashboard-data'

interface CategoryBreakdownProps {
  month: number
  year: number
}

export function CategoryBreakdown({ month, year }: CategoryBreakdownProps) {
  const { data: categories, isLoading } = useCategoryBreakdown(month, year)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="mx-auto h-[200px] w-[200px] rounded-full" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={PieChartIcon}
            title="Sem despesas"
            description="Nenhuma despesa registrada neste periodo."
            className="py-8"
          />
        </CardContent>
      </Card>
    )
  }

  const chartConfig: ChartConfig = {}
  for (const cat of categories) {
    chartConfig[cat.category_name] = {
      label: cat.category_name,
      color: cat.category_color,
    }
  }

  const chartData = categories.map((cat) => ({
    name: cat.category_name,
    value: cat.total,
    fill: cat.category_color,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto h-[200px] w-[200px]">
          <PieChart accessibilityLayer>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    formatCurrency(value as number)
                  }
                  nameKey="name"
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="mt-4 space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.category_id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.category_color }}
                />
                <span className="truncate">{cat.category_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  {formatCurrency(cat.total)}
                </span>
                <span className="text-muted-foreground">
                  {cat.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
