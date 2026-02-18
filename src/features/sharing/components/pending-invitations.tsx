import { Loader2, Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSharedWithMe, useRespondToInvite } from '../hooks/use-sharing'

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function PendingInvitations() {
  const { data: shares = [], isLoading } = useSharedWithMe()
  const respondMutation = useRespondToInvite()

  const pending = shares.filter((s) => s.status === 'pending')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (pending.length === 0) return null

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Convites Pendentes</h4>
      {pending.map((share) => (
        <div
          key={share.id}
          className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3"
        >
          <Avatar size="sm">
            <AvatarFallback className="text-xs">
              {getInitials(share.owner?.full_name ?? null)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {share.owner?.full_name ?? 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground">
              Quer compartilhar dados com você
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {share.permission === 'viewer' ? 'Visualizar' : 'Editar'}
          </Badge>
          <div className="flex gap-1 shrink-0">
            <Button
              size="icon-xs"
              variant="outline"
              className="text-emerald-500 hover:bg-emerald-500/10"
              onClick={() =>
                respondMutation.mutate({ shareId: share.id, accept: true })
              }
              disabled={respondMutation.isPending}
            >
              <Check className="size-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant="outline"
              className="text-destructive hover:bg-destructive/10"
              onClick={() =>
                respondMutation.mutate({ shareId: share.id, accept: false })
              }
              disabled={respondMutation.isPending}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
