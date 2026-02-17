import { NavLink } from 'react-router'
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Transações',
    href: '/transactions',
    icon: ArrowLeftRight,
  },
  {
    label: 'Cartões',
    href: '/credit-cards',
    icon: CreditCard,
  },
  {
    label: 'Config.',
    href: '/settings',
    icon: Settings,
  },
] as const

export function MobileNav() {
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 md:hidden',
        'border-t border-border/50',
        'bg-background/80 backdrop-blur-xl',
        'pb-[env(safe-area-inset-bottom)]'
      )}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium',
                'transition-colors duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'flex items-center justify-center rounded-lg p-1 transition-all duration-200',
                    isActive && 'bg-primary/10'
                  )}
                >
                  <item.icon
                    className={cn(
                      'size-5 transition-colors duration-200',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    )}
                  />
                </div>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
