'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  onDetected: (code: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let controls: import('@zxing/browser').IScannerControls | null = null
    let stopped = false

    const startScanner = async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const reader = new BrowserMultiFormatReader()
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        if (devices.length === 0) {
          setError('カメラが見つかりません')
          return
        }
        const deviceId = devices[devices.length - 1].deviceId
        controls = await reader.decodeFromVideoDevice(deviceId, videoRef.current!, (result, err) => {
          if (stopped) return
          if (result) {
            stopped = true
            controls?.stop()
            onDetected(result.getText())
          }
          if (err && !(err instanceof Error && err.message.includes('No MultiFormat'))) {
            // 継続中のエラーは無視
          }
        })
      } catch (e) {
        setError('カメラの起動に失敗しました')
        console.error(e)
      }
    }

    startScanner()

    return () => {
      stopped = true
      controls?.stop()
    }
  }, [onDetected])

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
        <p className="p-4 text-sm text-gray-500 text-center">バーコードをカメラに向けてください</p>
      </div>
    </div>
  )
}
