import { supabase } from '@/lib/supabase'
import type { Profile, ProfileUpdate } from '@/types'

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  },

  async updateProfile(
    userId: string,
    updates: Omit<ProfileUpdate, 'id'>
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async seedDefaultCategories(userId: string): Promise<void> {
    const { error } = await supabase.rpc('seed_default_categories', {
      p_user_id: userId,
    })

    if (error) throw error
  },
}
