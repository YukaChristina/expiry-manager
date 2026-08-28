import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

const CATEGORY_LABEL: Record<string, string> = {
  condiment: '調味料',
  food: '食品',
  disaster: '防災備蓄',
  other: 'その他',
}

function todayStamp() {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return jst.toISOString().slice(0, 10).replace(/-/g, '')
}

export async function GET(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  let query = supabaseServer
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .order('expiry_date', { ascending: true })

  if (category && category !== 'all') {
    query = query.contains('categories', [category])
  }
  if (search) query = query.ilike('name', `%${search}%`)

  const { data: items } = await query

  const header = '食品名,カテゴリ,消費期限,保存場所,数量,防災用\n'
  const rows = (items ?? []).map((item) =>
    [
      item.name,
      item.categories.map((c: string) => CATEGORY_LABEL[c] ?? c).join('・'),
      item.expiry_date,
      item.location ?? '',
      item.quantity,
      item.categories.includes('disaster') ? '○' : '',
    ].join(',')
  ).join('\n')

  const filename = `長期保存アイテムリスト_${todayStamp()}.csv`

  return new NextResponse('﻿' + header + rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="export.csv"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  })
}
