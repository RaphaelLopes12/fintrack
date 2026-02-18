import { Users, ChevronDown, Eye, Pencil } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSharedWithMe } from '@/features/sharing/hooks/use-sharing'
import { useSharedContext } from '@/features/sharing/hooks/use-shared-context'

export function ContextSwitcher() {
  const { data: sharedWithMe = [] } = useSharedWithMe()
  const { viewingUserId, viewingUserName, permission, setViewingUser, resetToSelf } =
    useSharedContext()

  const acceptedShares = sharedWithMe.filter((s) => s.status === 'accepted')

  if (acceptedShares.length === 0) return null

  const isViewingOther = viewingUserId !== null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isViewingOther ? 'secondary' : 'ghost'}
          size="sm"
          className="gap-1.5"
        >
          <Users className="size-4" />
          <span className="hidden sm:inline text-xs">
            {isViewingOther ? viewingUserName : 'Meus dados'}
          </span>
          {isViewingOther && (
            <Badge
              variant="secondary"
              className="text-[9px] px-1 py-0"
            >
              {permission === 'viewer' ? (
                <Eye className="size-2.5" />
              ) : (
                <Pencil className="size-2.5" />
              )}
            </Badge>
          )}
          <ChevronDown className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Visualizando dados de
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={resetToSelf}
          className={!isViewingOther ? 'bg-accent' : ''}
        >
          <span className="flex-1">Meus dados</span>
          {!isViewingOther && (
            <Badge variant="secondary" className="text-[9px]">
              Atual
            </Badge>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {acceptedShares.map((share) => {
          const isActive = viewingUserId === share.owner_id
          const displayName = share.owner?.full_name ?? 'Usuário'

          return (
            <DropdownMenuItem
              key={share.id}
              onClick={() =>
                setViewingUser(
                  share.owner_id,
                  displayName,
                  share.permission as 'viewer' | 'editor'
                )
              }
              className={isActive ? 'bg-accent' : ''}
            >
              <span className="flex-1 truncate">{displayName}</span>
              <Badge variant="secondary" className="text-[9px] shrink-0">
                {share.permission === 'viewer' ? (
                  <>
                    <Eye className="size-2.5" />
                    Ver
                  </>
                ) : (
                  <>
                    <Pencil className="size-2.5" />
                    Editar
                  </>
                )}
              </Badge>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
