import { useState } from 'react'
import { Loader2, Mail, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { sharingService } from '../services/sharing.service'
import { useInviteUser } from '../hooks/use-sharing'
import type { SharePermission } from '../types/sharing.types'

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<SharePermission>('viewer')
  const [checking, setChecking] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  const inviteMutation = useInviteUser()

  async function handleCheckEmail() {
    if (!email.trim()) return

    setChecking(true)
    setUserName(null)
    setChecked(false)

    try {
      const name = await sharingService.checkUserExists(email)
      setUserName(name)
      setChecked(true)
    } catch {
      setChecked(true)
    } finally {
      setChecking(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    inviteMutation.mutate(
      { email: email.trim(), permission },
      {
        onSuccess: () => {
          setEmail('')
          setPermission('viewer')
          setUserName(null)
          setChecked(false)
          onOpenChange(false)
        },
      }
    )
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setEmail('')
      setPermission('viewer')
      setUserName(null)
      setChecked(false)
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar Pessoa</DialogTitle>
          <DialogDescription>
            Digite o e-mail da pessoa com quem deseja compartilhar seus dados
            financeiros.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">E-mail</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setChecked(false)
                    setUserName(null)
                  }}
                  className="pl-9"
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCheckEmail}
                disabled={!email.trim() || checking}
              >
                {checking ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
              </Button>
            </div>

            {checked && (
              <div className="text-sm">
                {userName ? (
                  <p className="text-emerald-500">
                    Usuário encontrado: <strong>{userName}</strong>
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Usuário ainda não cadastrado. O convite ficará pendente até
                    que ele crie uma conta.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Permissão</Label>
            <Select
              value={permission}
              onValueChange={(v) => setPermission(v as SharePermission)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      Visualizar
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Apenas leitura
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      Editar
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Pode criar, editar e excluir
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!email.trim() || inviteMutation.isPending}
            >
              {inviteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Enviar Convite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
