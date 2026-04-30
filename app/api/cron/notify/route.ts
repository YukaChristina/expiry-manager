import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function GET(request: Request) {
  // Vercel Cron 認証チェック（CRON_SECRETが設定されている場合のみ）
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const { data: items, error } = await supabaseServer
    .from('items')
    .select('*')
    .is('notified_at', null)
    .eq('send_email', true)
    .gte('expiry_date', todayStr)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!items?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  for (const item of items) {
    const expiry = new Date(item.expiry_date)
    const daysLeft = Math.round((expiry.getTime() - today.getTime()) / 86400000)

    if (daysLeft > item.notify_days) continue

    const { data: userData } = await supabaseServer.auth.admin.getUserById(item.user_id)
    const email = userData?.user?.email
    if (!email) continue

    const daysLabel = daysLeft === 0 ? '本日' : `あと${daysLeft}日`

    const { error: sendError } = await resend.emails.send({
      from: 'Expiry Manager <noreply@yuka-studio.net>',
      to: email,
      subject: `【期限注意】${item.name} の消費期限は${daysLabel}です`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#e67e22">⚠️ 消費期限のお知らせ</h2>
          <p><strong>${item.name}</strong> の消費期限が近づいています。</p>
          <table style="border-collapse:collapse;width:100%;margin:16px 0">
            <tr><td style="padding:8px;color:#666">期限</td><td style="padding:8px"><strong>${item.expiry_date}</strong>（${daysLabel}）</td></tr>
            <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">保存場所</td><td style="padding:8px">${item.location || '未設定'}</td></tr>
            <tr><td style="padding:8px;color:#666">数量</td><td style="padding:8px">${item.quantity}個</td></tr>
          </table>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display:inline-block;background:#e67e22;color:white;padding:12px 24px;border-radius:6px;text-decoration:none">アプリで確認する</a>
        </div>
      `,
    })

    if (sendError) continue

    await supabaseServer
      .from('items')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', item.id)

    sent++
  }

  return NextResponse.json({ sent })
}
