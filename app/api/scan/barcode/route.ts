import { NextRequest, NextResponse } from 'next/server'

async function tryOpenFoodFacts(barcode: string) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
      headers: { 'User-Agent': 'expiry-manager/1.0' },
      signal: AbortSignal.timeout(5000),
    })
    const data = await res.json()
    if (data.status === 1) {
      const p = data.product
      return p.product_name_ja || p.product_name || null
    }
  } catch {
    // ignore
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

  let offName: string | null = null
  let upcName: string | null = null
  let offError = ''

  try {
    offName = await tryOpenFoodFacts(barcode)
  } catch (e) {
    offError = String(e)
  }

  if (!offName) {
    upcName = await tryUpcItemDb(barcode)
  }

  const name = offName ?? upcName

  if (!name) {
    return NextResponse.json({ found: false, debug: { offError } })
  }

  return NextResponse.json({ found: true, name })
}
