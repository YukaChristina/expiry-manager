'use client'

import { useRef, useState } from 'react'

type Props = {
  value: string
  onChange: (date: string) => void
}

export default function ExpiryInput({ value, onChange }: Props) {
  const [mode, setMode] = useState<'manual' | 'ocr'>('manual')
  const [loading, setLoading] = useState(false)
  const [ocrName, setOcrName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = (reader.result as string).replace(/^data:image\/\w+;base64,/, '')
      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp'
      try {
        const res = await fetch('/api/scan/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        })
        const data = await res.json()
        if (data.expiry) onChange(data.expiry)
        if (data.name) setOcrName(data.name)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3">
      {/* モード切替 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
            mode === 'manual'
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
          }`}
        >
          手入力
        </button>
        <button
          type="button"
          onClick={() => setMode('ocr')}
          className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${
            mode === 'ocr'
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
          }`}
        >
          写真撮影
        </button>
      </div>

      {mode === 'manual' ? (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          required
        />
      ) : (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhoto}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'AIが読み取り中...' : '📷 期限ラベルを撮影'}
          </button>
          {value && (
            <p className="mt-2 text-sm text-gray-600">
              認識結果: <span className="font-medium text-indigo-600">{value}</span>
              {ocrName && ` / ${ocrName}`}
              <span className="ml-2 text-gray-400 text-xs">（修正可）</span>
            </p>
          )}
          {value && (
            <input
              type="date"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-2"
            />
          )}
        </div>
      )}
    </div>
  )
}
