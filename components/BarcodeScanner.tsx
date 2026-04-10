'use client'

import { useEffect, useRef } from 'react'

type Props = {
  onDetected: (code: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const onDetectedRef = useRef(onDetected)
  onDetectedRef.current = onDetected
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    let scanner: import('html5-qrcode').Html5Qrcode | null = null

    const startScanner = async () => {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode')
      scanner = new Html5Qrcode('qr-reader', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
        ],
        verbose: false,
      })
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 15, qrbox: { width: 280, height: 120 } },
          (code) => {
            scanner?.stop()
            onDetectedRef.current(code)
          },
          () => {}
        )
      } catch (e) {
        console.error(e)
      }
    }

    startScanner()

    return () => {
      scanner?.stop().catch(() => {})
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">バーコードをスキャン v2</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div id="qr-reader" className="w-full" />
        <p className="p-4 text-sm text-gray-500 text-center">バーコードをカメラに向けてください</p>
      </div>
    </div>
  )
}
