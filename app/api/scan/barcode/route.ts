import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const barcode = req.nextUrl.searchParams.get('code')
  if (!barcode) return NextResponse.json({ error: 'No barcode' }, { status: 400 })

  const res = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
  )
  const data = await res.json()

  if (data.status !== 1) {
    return NextResponse.json({ found: false })
  }

  const product = data.product
  return NextResponse.json({
    found: true,
    name: product.product_name_ja || product.product_name || '',
    category: product.categories_tags?.[0] || '',
    imageUrl: product.image_url || '',
  })
}
