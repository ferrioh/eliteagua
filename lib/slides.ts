import { createClient } from '@/lib/supabase/server'

export type SlideRow = {
  id: string
  created_at: string
  image_url: string
  position: number
}

export const fallbackSlides = ['/elite-slide.jpg', '/elite-slide-2.png', '/elite-slide-3.png']

export async function getSlides(): Promise<string[]> {
  const supabase = await createClient()
  if (!supabase) return fallbackSlides
  const { data, error } = await supabase
    .from('slides')
    .select('image_url')
    .order('position', { ascending: true })
  if (error || !data || data.length === 0) return fallbackSlides
  return data.map((slide) => slide.image_url)
}