import { createClient } from '@/lib/supabase/server'

export type SiteSettings = {
  instagram_url: string
  facebook_url: string
  x_url: string
}

export const defaultSettings: SiteSettings = { instagram_url: '', facebook_url: '', x_url: '' }

export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createClient()
  if (!supabase) return defaultSettings
  const { data } = await supabase
    .from('settings')
    .select('instagram_url, facebook_url, x_url')
    .eq('id', 'general')
    .maybeSingle()
  return data ?? defaultSettings
}