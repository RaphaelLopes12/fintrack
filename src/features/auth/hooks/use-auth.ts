import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { authService } from '@/features/auth/services/auth.service'
import { profileService } from '@/features/auth/services/profile.service'
import { sharingService } from '@/features/sharing/services/sharing.service'
import { useSharedContext } from '@/features/sharing/hooks/use-shared-context'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  initialize: () => () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: () => {
    authService.getSession().then((session) => {
      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      })
    }).catch(() => {
      set({ isLoading: false })
    })

    const subscription = authService.onAuthStateChange(
      async (event, session) => {
        set({
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
          isLoading: false,
        })

        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const profile = await profileService.getProfile(session.user.id)
            if (!profile) {
              await profileService.seedDefaultCategories(session.user.id)
            }
          } catch {
            /* empty */
          }

          try {
            await sharingService.resolvePendingShares()
          } catch {
            /* empty */
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  },

  signIn: async (email: string, password: string) => {
    const { session, user } = await authService.signInWithEmail(email, password)
    set({
      session,
      user,
      isAuthenticated: !!user,
    })
  },

  signUp: async (email: string, password: string, fullName: string) => {
    await authService.signUpWithEmail(email, password, fullName)
  },

  signInWithGoogle: async () => {
    await authService.signInWithGoogle()
  },

  signOut: async () => {
    await authService.signOut()
    useSharedContext.getState().resetToSelf()
    set({
      user: null,
      session: null,
      isAuthenticated: false,
    })
  },
}))
