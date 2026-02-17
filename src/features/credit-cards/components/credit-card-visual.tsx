import { cn } from '@/lib/utils'
import { CARD_BRANDS } from '@/lib/constants'
import type { CreditCard } from '@/types'

interface CreditCardVisualProps {
  card: CreditCard
  className?: string
  onClick?: () => void
}

function getBrandLabel(brand: string): string {
  const found = CARD_BRANDS.find((b) => b.value === brand)
  return found?.label ?? brand
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff'
}

function lightenColor(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount)
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount)
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function CreditCardVisual({
  card,
  className,
  onClick,
}: CreditCardVisualProps) {
  const baseColor = card.color || '#1e293b'
  const lightColor = lightenColor(baseColor, 40)
  const textColor = getContrastColor(baseColor)

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'relative aspect-[1.586/1] w-full max-w-[360px] overflow-hidden rounded-2xl p-5 shadow-lg transition-transform duration-200',
        onClick && 'cursor-pointer hover:scale-[1.03] active:scale-[0.98]',
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${baseColor} 0%, ${lightColor} 100%)`,
        color: textColor,
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -right-8 -top-8 size-32 rounded-full opacity-10"
        style={{ backgroundColor: textColor }}
      />
      <div
        className="absolute -bottom-6 -left-6 size-24 rounded-full opacity-10"
        style={{ backgroundColor: textColor }}
      />

      <div className="relative flex h-full flex-col justify-between">
        {/* Top row: brand */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium opacity-80">
            {getBrandLabel(card.brand)}
          </span>
          <div
            className="size-8 rounded-full opacity-60"
            style={{
              background: `linear-gradient(135deg, ${textColor}33 0%, ${textColor}11 100%)`,
              border: `1px solid ${textColor}33`,
            }}
          />
        </div>

        {/* Card number */}
        <div className="space-y-1">
          <p className="font-mono text-lg tracking-[0.2em] opacity-90">
            {'•••• •••• •••• '}
            {card.last_four_digits}
          </p>
        </div>

        {/* Bottom row: name */}
        <div className="flex items-end justify-between">
          <span className="text-sm font-semibold uppercase tracking-wider">
            {card.name}
          </span>
        </div>
      </div>
    </div>
  )
}
