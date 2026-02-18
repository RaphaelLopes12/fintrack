import { supabase } from '@/lib/supabase'
import type { SharedAccessInsert, SharedAccessUpdate } from '@/types'
import type {
  SharedAccessWithOwner,
  SharedAccessWithTarget,
  SharePermission,
} from '../types/sharing.types'

export const sharingService = {
  async getMyShares(userId: string): Promise<SharedAccessWithTarget[]> {
    const { data, error } = await supabase
      .from('shared_access')
      .select('*, shared_with:profiles!shared_access_shared_with_id_fkey(id, full_name, avatar_url)')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data ?? []).map((item) => ({
      ...item,
      shared_with: item.shared_with as unknown as SharedAccessWithTarget['shared_with'],
    }))
  },

  async getSharedWithMe(userId: string): Promise<SharedAccessWithOwner[]> {
    const { data, error } = await supabase
      .from('shared_access')
      .select('*, owner:profiles!shared_access_owner_id_fkey(id, full_name, avatar_url)')
      .eq('shared_with_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data ?? []).map((item) => ({
      ...item,
      owner: item.owner as unknown as SharedAccessWithOwner['owner'],
    }))
  },

  async inviteUser(
    ownerId: string,
    email: string,
    permission: SharePermission
  ): Promise<void> {
    const insert: SharedAccessInsert = {
      owner_id: ownerId,
      shared_with_email: email.toLowerCase().trim(),
      permission,
    }

    const { error } = await supabase.from('shared_access').insert(insert)

    if (error) {
      if (error.code === '23505') {
        throw new Error('Este e-mail já foi convidado.')
      }
      throw error
    }
  },

  async respondToInvite(
    shareId: string,
    accept: boolean
  ): Promise<void> {
    const update: SharedAccessUpdate = {
      status: accept ? 'accepted' : 'rejected',
      accepted_at: accept ? new Date().toISOString() : null,
    }

    const { error } = await supabase
      .from('shared_access')
      .update(update)
      .eq('id', shareId)

    if (error) throw error
  },

  async revokeShare(shareId: string): Promise<void> {
    const { error } = await supabase
      .from('shared_access')
      .delete()
      .eq('id', shareId)

    if (error) throw error
  },

  async updatePermission(
    shareId: string,
    permission: SharePermission
  ): Promise<void> {
    const { error } = await supabase
      .from('shared_access')
      .update({ permission })
      .eq('id', shareId)

    if (error) throw error
  },

  async checkUserExists(email: string): Promise<string | null> {
    const { data, error } = await supabase.rpc('check_user_exists', {
      p_email: email.toLowerCase().trim(),
    })

    if (error) throw error
    return data?.[0]?.user_name ?? null
  },

  async resolvePendingShares(): Promise<void> {
    const { error } = await supabase.rpc('resolve_pending_shares')
    if (error) throw error
  },
}
