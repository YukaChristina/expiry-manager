'use client'

import { useRef, useState } from 'react'

type Props = {
  onDetected: (code: string, name?: string, expiryDate?: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    setLoading(true)
    setError('')

    // Chrome / Android: ネイティブBarcodeDetector（高速・無料）
    if ('BarcodeDetector' in window) {
      try {
        const detector = new (window as { BarcodeDetector: new (opts: object) => { detect: (img: HTMLImageElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
        })
        const img = new Image()
        img.src = previewUrl
        await new Promise<void>((r) => { img.onload = () => r() })
        const barcodes = await detector.detect(img)
        if (barcodes.length > 0) {
          setLoading(false)
          onDetected(barcodes[0].rawValue)
          return
        }
      } catch {}
    }

    // iOS / フォールバック: Claude Vision でバーコード＋商品名を読み取る
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/scan/barcode-image', { method: 'POST', body: formData })
      const data = await res.json() as { barcode: string | null; name: string | null; expiry_date: string | null }

      if (data.barcode || data.name) {
        onDetected(data.barcode ?? '', data.name ?? undefined, data.expiry_date ?? undefined)
      } else {
        setError('読み取れませんでした。バーコードと商品名が映るように撮り直してください。')
      }
    } catch {
      setError('エラーが発生しました。もう一度試してください。')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setPreview(null)
    setError('')
    inputRef.current!.value = ''
    inputRef.current?.click()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">商品を撮影</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {preview ? (
            <img src={preview} alt="preview" className="w-full rounded-xl object-contain max-h-48 bg-gray-50" />
          ) : (
            <div className="aspect-video bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2">
              <span className="text-4xl">📷</span>
              <p className="text-sm text-center px-4">バーコードと商品名が<br/>映るように撮影してください</p>
            </div>
          )}

          {loading && (
            <p className="text-center text-sm text-indigo-600 animate-pulse">商品情報を読み取り中...</p>
          )}
          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCapture}
          />

          {!loading && (
            <button
              onClick={preview ? handleRetry : () => inputRef.current?.click()}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
            >
              {preview ? '📷 撮り直す' : '📷 カメラで撮影する'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
