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
    max_tokens: 50,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 },
        },
        {
          type: 'text',
          text: 'この画像に写っているバーコード（JANコード・EAN-13・UPCなど）の数字を読み取り、数字のみを返してください。バーコードが見つからない場合は "NOT_FOUND" とだけ返してください。余計な説明は不要です。',
        },
      ],
    }],
  })

  const text = (response.content[0] as { type: string; text: string }).text.trim().replace(/\s/g, '')

  if (text === 'NOT_FOUND' || !/^\d{7,14}$/.test(text)) {
    return NextResponse.json({ barcode: null })
  }

  return NextResponse.json({ barcode: text })
}
