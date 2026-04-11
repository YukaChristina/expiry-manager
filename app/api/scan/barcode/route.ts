import { NextRequest, NextResponse } from 'next/server'

async function tryOpenFoodFacts(barcode: string): Promise<string | null> {
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
  } catch {}
  return null
}

async function tryRakuten(barcode: string): Promise<string | null> {
  try {
    const appId = process.env.RAKUTEN_APP_ID
    if (!appId) return null
    const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?applicationId=${appId}&janCode=${barcode}&hits=1&format=json`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    const data = await res.json()
    const item = data.Items?.[0]?.Item
    if (item?.itemName) return item.itemName
  } catch {}
  return null
}

async function tryUpcItemDb(barcode: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.items?.[0]?.title || null
  } catch {}
  return null
}

export async function GET(req: NextRequest) {
  const barcode = req.nextUrl.searchParams.get('code')
  if (!barcode) return NextResponse.json({ error: 'No barcode' }, { status: 400 })

  const name =
    await tryOpenFoodFacts(barcode) ??
    await tryRakuten(barcode) ??
    await tryUpcItemDb(barcode)

  if (!name) {
    return NextResponse.json({ found: false })
  }

  return NextResponse.json({ found: true, name })
}
