import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: number
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0
  const isNegative = trend !== undefined && trend < 0

  return (
    <Card className={cn('py-4', className)}>
      <CardContent className="flex items-center gap-4">
        <div
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-xl',
            'bg-primary/10'
          )}
        >
          <Icon className="size-6 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {trend !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-medium',
                  isPositive && 'text-success',
                  isNegative && 'text-destructive'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {Math.abs(trend).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
