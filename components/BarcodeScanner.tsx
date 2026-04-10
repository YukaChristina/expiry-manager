'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  onDetected: (code: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')
  const [debug, setDebug] = useState('初期化中...')

  useEffect(() => {
    let controls: import('@zxing/browser').IScannerControls | null = null
    let stopped = false

    const startScanner = async () => {
      try {
        setDebug('ライブラリ読み込み中...')
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const { DecodeHintType, BarcodeFormat } = await import('@zxing/library')

        const hints = new Map()
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
        ])
        hints.set(DecodeHintType.TRY_HARDER, true)

        setDebug('カメラ起動中...')
        const reader = new BrowserMultiFormatReader(hints)
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: 'environment' } },
          videoRef.current!,
          (result, _err) => {
            if (stopped) return
            if (result) {
              stopped = true
              controls?.stop()
              setDebug(`検出: ${result.getText()}`)
              onDetected(result.getText())
            }
          }
        )
        setDebug('スキャン中...')
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setError('カメラの起動に失敗しました')
        setDebug(`エラー: ${msg}`)
        console.error(e)
      }
    }

    startScanner()

    return () => {
      stopped = true
      controls?.stop()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">バーコードをスキャン</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="relative bg-black aspect-video">
          <video ref={videoRef} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-24 border-2 border-white/70 rounded" />
          </div>
        </div>
        {error && <p className="p-4 text-red-500 text-sm text-center">{error}</p>}
        <p className="p-4 text-sm text-red-600 font-bold text-center">{debug}</p>
        <p className="pb-4 text-sm text-gray-500 text-center">バーコードをカメラに向けてください</p>
      </div>
    </div>
  )
}
