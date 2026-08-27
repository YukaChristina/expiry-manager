import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

function getUserSupabase(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
}

export async function DELETE(req: NextRequest) {
  const supabase = getUserSupabase(req)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error: itemsError } = await supabaseServer.from('items').delete().eq('user_id', user.id)
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  const { error: userError } = await supabaseServer.auth.admin.deleteUser(user.id)
  if (userError) return NextResponse.json({ error: userError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
