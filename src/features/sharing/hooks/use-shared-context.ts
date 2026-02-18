import { create } from 'zustand'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface SharedContextState {
  viewingUserId: string | null
  viewingUserName: string | null
  permission: 'owner' | 'viewer' | 'editor'
  setViewingUser: (
    userId: string | null,
    name: string | null,
    permission: 'owner' | 'viewer' | 'editor'
  ) => void
  resetToSelf: () => void
}

export const useSharedContext = create<SharedContextState>()((set) => ({
  viewingUserId: null,
  viewingUserName: null,
  permission: 'owner',

  setViewingUser: (userId, name, permission) =>
    set({ viewingUserId: userId, viewingUserName: name, permission }),

  resetToSelf: () =>
    set({ viewingUserId: null, viewingUserName: null, permission: 'owner' }),
}))

export function useActiveUserId(): string | undefined {
  const user = useAuth((state) => state.user)
  const viewingUserId = useSharedContext((state) => state.viewingUserId)
  return viewingUserId ?? user?.id
}

export function useCanEdit(): boolean {
  const permission = useSharedContext((state) => state.permission)
  return permission === 'owner' || permission === 'editor'
}
