import { NavLink, useLocation } from 'react-router'
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar.store'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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
    label: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
] as const

function getInitials(name: string | undefined | null): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Sidebar() {
  const { isCollapsed, toggleCollapse } = useSidebarStore()
  const { user, signOut } = useAuth()
  const location = useLocation()

  const displayName =
    user?.user_metadata?.full_name ?? user?.email ?? 'Usuário'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r border-border/50',
        'bg-background/80 backdrop-blur-xl',
        'transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Wallet className="size-5 text-primary-foreground" />
        </div>
        <span
          className={cn(
            'text-lg font-bold tracking-tight transition-all duration-300',
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
        >
          FinTrack
        </span>
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href)

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                'transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <item.icon
                className={cn(
                  'size-5 shrink-0 transition-colors duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span
                className={cn(
                  'transition-all duration-300',
                  isCollapsed ? 'hidden' : 'block'
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <div
                  className={cn(
                    'absolute left-0 h-8 w-[3px] rounded-r-full bg-primary transition-all duration-300',
                    isCollapsed && 'h-6'
                  )}
                />
              )}
            </NavLink>
          )
        })}
      </nav>

      <Separator className="opacity-50" />

      {/* User section */}
      <div className="p-3">
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5',
            isCollapsed && 'justify-center px-0'
          )}
        >
          <Avatar size="sm">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="text-xs">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => signOut()}
              className="shrink-0 text-muted-foreground hover:text-destructive"
              title="Sair"
            >
              <LogOut className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <Button
        variant="outline"
        size="icon-xs"
        onClick={toggleCollapse}
        className={cn(
          'absolute -right-3 top-20 z-10 rounded-full border shadow-md',
          'bg-background hover:bg-accent',
          'transition-transform duration-300'
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="size-3" />
        ) : (
          <ChevronLeft className="size-3" />
        )}
      </Button>
    </aside>
  )
}
