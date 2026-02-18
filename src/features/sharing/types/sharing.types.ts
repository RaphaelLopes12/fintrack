import type { SharedAccess, Profile } from '@/types'

export type SharePermission = 'viewer' | 'editor'
export type ShareStatus = 'pending' | 'accepted' | 'rejected'

export type SharedAccessWithOwner = SharedAccess & {
  owner: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}

export type SharedAccessWithTarget = SharedAccess & {
  shared_with: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}
