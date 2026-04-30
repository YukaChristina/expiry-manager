'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  onDetected: (code: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const [error, setError] = useState('')
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null)
  const doneRef = useRef(false)
  const onDetectedRef = useRef(onDetected)
  onDetectedRef.current = onDetected

  useEffect(() => {
    const start = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        const scanner = new Html5Qrcode('barcode-reader-container', { verbose: false })
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 260, height: 110 },
            aspectRatio: 1.777,
          },
          (code) => {
            if (doneRef.current) return
            doneRef.current = true
            scanner.stop().catch(() => {})
            onDetectedRef.current(code)
          },
          () => {},
        )
      } catch (e) {
        setError('カメラを起動できませんでした。カメラへのアクセスを許可してください。')
        console.error(e)
      }
    }

    start()

    return () => {
      doneRef.current = true
      scannerRef.current?.stop().catch(() => {})
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">バーコードをスキャン</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div id="barcode-reader-container" className="w-full" />
        {error && <p className="p-4 text-red-500 text-sm text-center">{error}</p>}
        <p className="p-4 text-sm text-gray-500 text-center">バーコードをカメラに向けてください</p>
      </div>
    </div>
  )
}
