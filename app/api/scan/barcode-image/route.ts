import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

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
    max_tokens: 200,
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
{"barcode":"バーコード番号の数字のみ、なければnull","name":"商品名（日本語）、なければnull"}

例: {"barcode":"4901234567890","name":"キッコーマン丸大豆しょうゆ500ml"}
バーコードが読めない場合: {"barcode":null,"name":"醤油"}
何も分からない場合: {"barcode":null,"name":null}`,
        },
      ],
    }],
  })

  const raw = (response.content[0] as { type: string; text: string }).text.trim()

  try {
    // マークダウンコードブロックを除去してパース
    const jsonStr = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim()
    const parsed = JSON.parse(jsonStr) as { barcode: string | null; name: string | null }

    const barcode = typeof parsed.barcode === 'string' && /^\d{7,14}$/.test(parsed.barcode)
      ? parsed.barcode
      : null
    const name = typeof parsed.name === 'string' && parsed.name.length > 0
      ? parsed.name
      : null

    return NextResponse.json({ barcode, name })
  } catch {
    return NextResponse.json({ barcode: null, name: null })
  }
}
