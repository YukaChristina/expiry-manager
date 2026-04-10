import { NextRequest, NextResponse } from 'next/server'

async function tryOpenFoodFacts(barcode: string) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
  const text = await res.arrayBuffer()
  const decoded = new TextDecoder('utf-8').decode(text)
  const data = JSON.parse(decoded)
  if (data.status === 1) {
    const p = data.product
    return p.product_name_ja || p.product_name || null
  }
  return null
}

async function tryUpcItemDb(barcode: string) {
  const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, {
    headers: { 'Accept': 'application/json' }
  })
  if (!res.ok) return null
  const data = await res.json()
  if (data.items?.length > 0) {
    return data.items[0].title || null
  }
  return null
}

export async function GET(req: NextRequest) {
  const barcode = req.nextUrl.searchParams.get('code')
  if (!barcode) return NextResponse.json({ error: 'No barcode' }, { status: 400 })

  const name = await tryOpenFoodFacts(barcode) ?? await tryUpcItemDb(barcode)

  if (!name) {
    return NextResponse.json({ found: false })
  }

  return NextResponse.json({ found: true, name })
}
