import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import ical from 'ical-generator'

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

  const calendar = ical({ name: '消費期限カレンダー' })

  for (const item of items ?? []) {
    const expiry = new Date(item.expiry_date)

    // 期限日
    calendar.createEvent({
      start: expiry,
      end: expiry,
      allDay: true,
      summary: `【期限】${item.name}`,
      description: `場所: ${item.location ?? '未設定'} / 数量: ${item.quantity}`,
    })

    // リマインド日（notify_days日前）
    if (item.notify_days) {
      const remind = new Date(expiry)
      remind.setDate(remind.getDate() - item.notify_days)
      calendar.createEvent({
        start: remind,
        end: remind,
        allDay: true,
        summary: `【リマインド】${item.name} まであと${item.notify_days}日`,
        description: `消費期限: ${item.expiry_date} / 場所: ${item.location ?? '未設定'} / 数量: ${item.quantity}`,
      })
    }
  }

  return new NextResponse(calendar.toString(), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="expiry.ics"',
    },
  })
}
