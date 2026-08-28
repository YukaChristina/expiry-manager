import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const image = formData.get('image') as File
  if (!image) return NextResponse.json({ error: 'No image' }, { status: 400 })

  const bytes = await image.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mediaType = (image.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp'

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 },
        },
        {
          type: 'text',
          text: `この商品画像から以下を読み取り、必ずJSONのみで返してください（マークダウン不要）:
{"barcode":"バーコード番号の数字のみ、なければnull","name":"商品名（日本語）、なければnull","expiry_date":"消費期限または賞味期限をYYYY-MM-DD形式で、なければnull"}

消費期限の注意:
- 「年月日」「賞味期限」「消費期限」「best before」などの近くにある日付を探す
- 年月のみ（日なし）の場合はその月末日を使う（例: 2026年5月→2026-05-31）
- 例: {"barcode":"4901234567890","name":"キッコーマン醤油","expiry_date":"2026-05-31"}
- 日付が読めない場合: {"barcode":"4901234567890","name":"醤油","expiry_date":null}`,
        },
      ],
    }],
  })

  const raw = (response.content[0] as { type: string; text: string }).text.trim()

  try {
    const jsonStr = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim()
    const parsed = JSON.parse(jsonStr) as { barcode: string | null; name: string | null; expiry_date: string | null }

    const barcode = typeof parsed.barcode === 'string' && /^\d{7,14}$/.test(parsed.barcode)
      ? parsed.barcode
      : null
    const name = typeof parsed.name === 'string' && parsed.name.length > 0
      ? parsed.name
      : null
    const expiry_date = typeof parsed.expiry_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.expiry_date)
      ? parsed.expiry_date
      : null

    return NextResponse.json({ barcode, name, expiry_date })
  } catch {
    return NextResponse.json({ barcode: null, name: null, expiry_date: null })
  }
}
