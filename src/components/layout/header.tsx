import { useLocation } from 'react-router'
import { Menu, User, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useSidebarStore } from '@/stores/sidebar.store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/layout/theme-toggle'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transacoes',
  '/transactions/new': 'Nova Transacao',
  '/credit-cards': 'Cartoes',
  '/settings': 'Configuracoes',
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) {
    return pageTitles[pathname]
  }

  if (/^\/transactions\/[^/]+\/edit$/.test(pathname)) {
    return 'Editar Transacao'
  }

  if (/^\/credit-cards\/[^/]+$/.test(pathname)) {
    return 'Detalhes do Cartao'
  }

  return 'FinTrack'
}

function getInitials(name: string | undefined | null): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Header() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { open } = useSidebarStore()

  const displayName =
    user?.user_metadata?.full_name ?? user?.email ?? 'Usuario'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const pageTitle = getPageTitle(location.pathname)

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center gap-4 px-4 md:px-6',
        'border-b border-border/50',
        'bg-background/80 backdrop-blur-xl'
      )}
    >
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={open}
        className="md:hidden"
      >
        <Menu className="size-5" />
        <span className="sr-only">Abrir menu</span>
      </Button>

      {/* Page title */}
      <h1 className="text-lg font-semibold">{pageTitle}</h1>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <ThemeToggle />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex items-center gap-2 rounded-full px-2"
            >
              <Avatar size="sm">
                {avatarUrl && (
                  <AvatarImage src={avatarUrl} alt={displayName} />
                )}
                <AvatarFallback className="text-xs">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/settings" className="flex items-center gap-2">
                <User className="size-4" />
                <span>Perfil</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/settings" className="flex items-center gap-2">
                <Settings className="size-4" />
                <span>Configuracoes</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <LogOut className="size-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
