import { useState } from 'react'
import {
  Users,
  UserPlus,
  Trash2,
  Loader2,
  Eye,
  Pencil,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useMyShares,
  useSharedWithMe,
  useRevokeShare,
  useUpdateSharePermission,
} from '../hooks/use-sharing'
import { InviteDialog } from './invite-dialog'
import { PendingInvitations } from './pending-invitations'
import type { SharePermission } from '../types/sharing.types'

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: 'Pendente',
    className: 'bg-amber-500/10 text-amber-500',
  },
  accepted: {
    icon: CheckCircle2,
    label: 'Aceito',
    className: 'bg-emerald-500/10 text-emerald-500',
  },
  rejected: {
    icon: XCircle,
    label: 'Recusado',
    className: 'bg-red-500/10 text-red-500',
  },
} as const

export function SharingSettings() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const { data: myShares = [], isLoading: loadingMyShares } = useMyShares()
  const { data: sharedWithMe = [], isLoading: loadingSharedWithMe } =
    useSharedWithMe()
  const revokeMutation = useRevokeShare()
  const updatePermissionMutation = useUpdateSharePermission()

  const acceptedSharedWithMe = sharedWithMe.filter(
    (s) => s.status === 'accepted'
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compartilhamento</CardTitle>
        <CardDescription>
          Gerencie quem tem acesso aos seus dados financeiros
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PendingInvitations />

        {/* My shares section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">
                Compartilhando meus dados
              </h4>
            </div>
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="size-4" />
              Convidar
            </Button>
          </div>

          {loadingMyShares ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : myShares.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Você ainda não compartilhou seus dados com ninguém.
            </p>
          ) : (
            <div className="space-y-2">
              {myShares.map((share) => {
                const statusConfig = STATUS_CONFIG[share.status]
                const StatusIcon = statusConfig.icon

                return (
                  <div
                    key={share.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Avatar size="sm">
                      <AvatarFallback className="text-xs">
                        {getInitials(share.shared_with?.full_name ?? null)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {share.shared_with?.full_name ??
                          share.shared_with_email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {share.shared_with_email}
                      </p>
                    </div>

                    <Badge
                      variant="secondary"
                      className={`text-[10px] shrink-0 ${statusConfig.className}`}
                    >
                      <StatusIcon className="size-3" />
                      {statusConfig.label}
                    </Badge>

                    {share.status === 'accepted' && (
                      <Select
                        value={share.permission}
                        onValueChange={(v) =>
                          updatePermissionMutation.mutate({
                            shareId: share.id,
                            permission: v as SharePermission,
                          })
                        }
                      >
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">
                            <div className="flex items-center gap-1.5">
                              <Eye className="size-3" />
                              Visualizar
                            </div>
                          </SelectItem>
                          <SelectItem value="editor">
                            <div className="flex items-center gap-1.5">
                              <Pencil className="size-3" />
                              Editar
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <Button
                      size="icon-xs"
                      variant="ghost"
                      className="shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => revokeMutation.mutate(share.id)}
                      disabled={revokeMutation.isPending}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {acceptedSharedWithMe.length > 0 && (
          <>
            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="size-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">
                  Dados compartilhados comigo
                </h4>
              </div>

              {loadingSharedWithMe ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {acceptedSharedWithMe.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
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
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {share.permission === 'viewer'
                          ? 'Visualizar'
                          : 'Editar'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </Card>
  )
}
