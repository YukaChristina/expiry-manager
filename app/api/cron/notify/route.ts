import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function GET() {
  const today = new Date()

  const { data: items } = await supabaseServer
    .from('items')
    .select('*')
    .is('notified_at', null)
    .eq('send_email', true)
    .gte('expiry_date', today.toISOString().slice(0, 10))

  if (!items?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  for (const item of items) {
    const expiry = new Date(item.expiry_date)
    const daysLeft = Math.round((expiry.getTime() - today.getTime()) / 86400000)

    if (daysLeft !== item.notify_days) continue

    // user_idからメールアドレスを取得
    const { data: userData } = await supabaseServer.auth.admin.getUserById(item.user_id)
    const email = userData?.user?.email
    if (!email) continue

    await resend.emails.send({
      from: 'Expiry Manager <noreply@yuka-studio.net>',
      to: email,
      subject: `【期限注意】${item.name} があと${daysLeft}日で期限切れです`,
      html: `
        <p>${item.name} の消費期限まであと <strong>${daysLeft}日</strong> です。</p>
        <p>保存場所: ${item.location || '未設定'} / 数量: ${item.quantity}個</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}">アプリで確認する</a></p>
      `
    })

    await supabaseServer
      .from('items')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', item.id)

    sent++
  }

  return NextResponse.json({ sent })
}
