import { useState } from 'react'
import { LogOut, Trash2, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

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
import { useAuth } from '@/features/auth/hooks/use-auth'

export function AccountSettings() {
  const signOut = useAuth((state) => state.signOut)
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      toast.error('Erro ao sair da conta. Tente novamente.')
      setIsSigningOut(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conta</CardTitle>
        <CardDescription>Gerencie sua conta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sign out section */}
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <LogOut className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-medium">Sair da conta</h4>
            <p className="text-sm text-muted-foreground">
              Você será desconectado de todos os dispositivos e precisará fazer
              login novamente.
            </p>
            <Button
              size="sm"
              variant="destructive"
              className="mt-3"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              {isSigningOut ? 'Saindo...' : 'Sair da conta'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Delete account section (placeholder) */}
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
            <Trash2 className="size-5 text-destructive" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-destructive">
                Excluir conta
              </h4>
              <Badge variant="secondary" className="text-[10px]">
                Em breve
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Exclua permanentemente sua conta e todos os dados associados. Esta
              ação não pode ser desfeita.
            </p>
            <Button size="sm" variant="destructive" className="mt-3" disabled>
              <Trash2 className="size-4" />
              Excluir conta
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
