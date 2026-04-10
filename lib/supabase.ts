import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Item = {
  id: string
  user_id: string
  name: string
  category: 'condiment' | 'disaster' | 'other'
  expiry_date: string
  location: string | null
  quantity: number
  is_disaster: boolean
  barcode: string | null
  image_url: string | null
  notify_days: number
  notified_at: string | null
  created_at: string
}
