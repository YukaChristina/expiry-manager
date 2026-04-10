import { NextRequest, NextResponse } from 'next/server'


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

  let offResult: { status?: number; name?: string; error?: string } = {}
  let upcName: string | null = null

  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
      headers: { 'User-Agent': 'expiry-manager/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    offResult.status = data.status
    if (data.status === 1) {
      const p = data.product
      offResult.name = p.product_name_ja || p.product_name || ''
    }
  } catch (e) {
    offResult.error = String(e)
  }

  const offName = offResult.name || null

  if (!offName) {
    upcName = await tryUpcItemDb(barcode)
  }

  const name = offName ?? upcName

  if (!name) {
    return NextResponse.json({ found: false, debug: offResult })
  }

  return NextResponse.json({ found: true, name })
}
