import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: items } = await supabaseServer
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .order('expiry_date', { ascending: true })

  const header = '食品名,カテゴリ,消費期限,保存場所,数量,防災用\n'
  const rows = (items ?? []).map((item) =>
    [item.name, item.category, item.expiry_date, item.location ?? '', item.quantity, item.is_disaster ? '○' : ''].join(',')
  ).join('\n')

  return new NextResponse('\uFEFF' + header + rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="expiry.csv"',
    },
  })
}
