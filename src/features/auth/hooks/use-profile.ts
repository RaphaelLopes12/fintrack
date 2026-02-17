import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService } from '@/features/auth/services/profile.service'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { ProfileUpdate } from '@/types'

const PROFILE_QUERY_KEY = ['profile'] as const

export function useProfile() {
  const user = useAuth((state) => state.user)

  return useQuery({
    queryKey: [...PROFILE_QUERY_KEY, user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('Usuario nao autenticado')
      return profileService.getProfile(user.id)
    },
    enabled: !!user?.id,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const user = useAuth((state) => state.user)

  return useMutation({
    mutationFn: (data: Omit<ProfileUpdate, 'id'>) => {
      if (!user?.id) throw new Error('Usuario nao autenticado')
      return profileService.updateProfile(user.id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
    },
  })
}
