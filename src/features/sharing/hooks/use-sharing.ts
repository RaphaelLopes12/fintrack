import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { sharingService } from '../services/sharing.service'
import type { SharePermission } from '../types/sharing.types'

export const sharingKeys = {
  all: ['sharing'] as const,
  myShares: () => [...sharingKeys.all, 'my-shares'] as const,
  sharedWithMe: () => [...sharingKeys.all, 'shared-with-me'] as const,
}

export function useMyShares() {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: sharingKeys.myShares(),
    queryFn: () => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      return sharingService.getMyShares(user.id)
    },
    enabled: !!user?.id,
  })
}

export function useSharedWithMe() {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: sharingKeys.sharedWithMe(),
    queryFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      await sharingService.resolvePendingShares()
      return sharingService.getSharedWithMe(user.id)
    },
    enabled: !!user?.id,
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()
  const user = useAuth((state) => state.user)

  return useMutation({
    mutationFn: ({
      email,
      permission,
    }: {
      email: string
      permission: SharePermission
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado')
      return sharingService.inviteUser(user.id, email, permission)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharingKeys.myShares() })
      toast.success('Convite enviado com sucesso!')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao enviar convite. Tente novamente.'
      )
    },
  })
}

export function useRespondToInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      shareId,
      accept,
    }: {
      shareId: string
      accept: boolean
    }) => sharingService.respondToInvite(shareId, accept),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: sharingKeys.all })
      toast.success(
        variables.accept ? 'Convite aceito!' : 'Convite recusado.'
      )
    },
    onError: () => {
      toast.error('Erro ao responder convite. Tente novamente.')
    },
  })
}

export function useRevokeShare() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (shareId: string) => sharingService.revokeShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharingKeys.all })
      toast.success('Compartilhamento removido.')
    },
    onError: () => {
      toast.error('Erro ao remover compartilhamento. Tente novamente.')
    },
  })
}

export function useUpdateSharePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      shareId,
      permission,
    }: {
      shareId: string
      permission: SharePermission
    }) => sharingService.updatePermission(shareId, permission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharingKeys.myShares() })
      toast.success('Permissão atualizada.')
    },
    onError: () => {
      toast.error('Erro ao atualizar permissão. Tente novamente.')
    },
  })
}
