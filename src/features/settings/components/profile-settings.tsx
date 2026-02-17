import { useState } from 'react'
import { Save, User, Camera } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useProfile, useUpdateProfile } from '@/features/auth/hooks/use-profile'

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ProfileSettings() {
  const user = useAuth((state) => state.user)
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  const [fullName, setFullName] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? ''
  const email = user?.email ?? ''

  function handleEditStart() {
    setFullName(displayName)
    setIsEditing(true)
  }

  function handleSave() {
    if (!fullName.trim()) {
      toast.error('O nome não pode estar vazio.')
      return
    }

    updateProfile.mutate(
      { full_name: fullName.trim() },
      {
        onSuccess: () => {
          toast.success('Perfil atualizado com sucesso!')
          setIsEditing(false)
        },
        onError: () => {
          toast.error('Erro ao atualizar perfil. Tente novamente.')
        },
      }
    )
  }

  function handleCancel() {
    setFullName(displayName)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Suas informações pessoais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="size-16 text-lg">
              <AvatarImage
                src={profile?.avatar_url ?? undefined}
                alt={displayName}
              />
              <AvatarFallback className="text-lg">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground transition-colors hover:bg-accent"
              title="Alterar foto (em breve)"
              disabled
            >
              <Camera className="size-3.5" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{displayName || 'Usuário'}</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <Separator />

        {/* Name edit section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              O e-mail não pode ser alterado.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave()
                    if (e.key === 'Escape') handleCancel()
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                >
                  <Save className="size-4" />
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateProfile.isPending}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  id="fullName"
                  value={displayName}
                  disabled
                  className="bg-muted"
                />
                <Button size="sm" variant="outline" onClick={handleEditStart}>
                  <User className="size-4" />
                  Editar
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
