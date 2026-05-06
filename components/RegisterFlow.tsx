'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ExpiryInput from './ExpiryInput'

type Step = 1 | 2 | 3

type FormData = {
  name: string
  category: 'condiment' | 'disaster' | 'other'
  expiry_date: string
  location: string
  quantity: number
  notify_days: number
  send_email: boolean
  is_disaster: boolean
  barcode: string
}

const STEPS = ['撮影', '情報入力', '確認']
const NOTIFY_OPTIONS = [3, 7, 14, 30]

export default function RegisterFlow() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [userEmail, setUserEmail] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [captureError, setCaptureError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [form, setForm] = useState<FormData>({
    name: '',
    category: 'other',
    expiry_date: '',
    location: '',
    quantity: 1,
    notify_days: 14,
    send_email: true,
    is_disaster: false,
    barcode: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? '')
    })
  }, [])

  // カメラストリームをvideo要素にセット
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraActive])

  // アンマウント時にカメラを停止
  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [])

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraActive(false)
  }, [])

  const openCamera = async () => {
    setCaptureError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      // getUserMedia非対応の場合はファイル入力にフォールバック
      fileInputRef.current?.click()
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      setCameraActive(true)
    } catch {
      // 権限拒否等の場合はファイル入力にフォールバック
      fileInputRef.current?.click()
    }
  }

  const takePhoto = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    closeCamera()
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
      await processCapture(file)
    }, 'image/jpeg', 0.85)
  }

  const processCapture = async (file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    setScanning(true)
    setCaptureError('')

    // Chrome/Android: ネイティブ BarcodeDetector（高速・無料）
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
          const code = barcodes[0].rawValue
          setForm((f) => ({ ...f, barcode: code }))
          setScanning(false)
          const res = await fetch(`/api/scan/barcode?code=${code}`)
          const data = await res.json()
          if (data.found && data.name) setForm((f) => ({ ...f, name: data.name }))
          return
        }
      } catch {}
    }

    // iOS/フォールバック: Claude Vision でバーコード＋商品名＋賞味期限を読み取る
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/scan/barcode-image', { method: 'POST', body: formData })
      const data = await res.json() as { barcode: string | null; name: string | null; expiry_date: string | null }

      if (data.barcode) setForm((f) => ({ ...f, barcode: data.barcode! }))
      if (data.name) setForm((f) => ({ ...f, name: data.name! }))
      if (data.expiry_date) setForm((f) => ({ ...f, expiry_date: data.expiry_date! }))

      if (!data.barcode && !data.name) {
        setCaptureError('読み取れませんでした。商品名と賞味期限が映るように撮り直してください。')
      }
    } catch {
      setCaptureError('エラーが発生しました。もう一度試してください。')
    } finally {
      setScanning(false)
    }
  }

  const handleFileCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processCapture(file)
  }

  const handleRetry = () => {
    setPreview(null)
    setCaptureError('')
    setForm((f) => ({ ...f, name: '', barcode: '', expiry_date: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
    openCamera()
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/')
      } else {
        setSubmitError(`登録失敗 (${res.status}): ${JSON.stringify(data)}`)
      }
    } catch (err) {
      setSubmitError(`エラー: ${String(err)}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* インブラウザカメラオーバーレイ */}
      {cameraActive && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="flex-1 w-full object-cover"
          />
          <div className="p-4 flex gap-3 bg-black safe-area-bottom">
            <button
              onClick={closeCamera}
              className="flex-1 border border-white/60 text-white py-4 rounded-xl font-medium text-sm"
            >
              キャンセル
            </button>
            <button
              onClick={takePhoto}
              className="flex-[2] bg-white text-black py-4 rounded-xl font-bold text-base"
            >
              📷 撮影する
            </button>
          </div>
        </div>
      )}

      {/* ステップバー */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => {
          const num = (i + 1) as Step
          const active = step === num
          const done = step > num
          return (
            <div key={label} className="flex-1 flex items-center">
              <div className={`flex items-center gap-2 ${i > 0 ? 'flex-1' : ''}`}>
                {i > 0 && <div className={`flex-1 h-0.5 ${done ? 'bg-indigo-500' : 'bg-gray-200'}`} />}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${active ? 'bg-indigo-600 text-white' : done ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? '✓' : num}
                </div>
                <span className={`text-sm ml-1 hidden sm:block ${active ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>{label}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Step 1: 商品撮影 */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-lg text-gray-800">商品を撮影する</h2>

          {/* ファイル入力（getUserMedia非対応端末のフォールバック） */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileCapture}
          />

          {preview ? (
            <img src={preview} alt="撮影した商品" className="w-full rounded-xl object-contain max-h-56 bg-gray-50" />
          ) : (
            <button
              onClick={openCamera}
              className="w-full border-2 border-purple-600 bg-white rounded-xl p-8 text-center text-purple-700 hover:bg-purple-50 transition-colors flex flex-col items-center"
            >
              <p className="text-3xl mb-2">📷</p>
              <p className="font-medium">商品を撮影する</p>
              <p className="text-sm mt-1 text-purple-500">商品名と賞味期限が両方映ると入力が簡単になります</p>
            </button>
          )}

          {scanning && <p className="text-center text-sm text-indigo-600 animate-pulse">商品情報を読み取り中...</p>}

          {captureError && (
            <p className="text-center text-sm text-red-500">{captureError}</p>
          )}

          {preview && !scanning && (
            <button
              onClick={handleRetry}
              className="w-full border-2 border-purple-600 bg-white rounded-xl py-3 text-center text-purple-700 hover:bg-purple-50 transition-colors font-medium text-sm"
            >
              📷 撮り直す
            </button>
          )}

          {form.name && (
            <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700">
              ✓ 「{form.name}」が見つかりました
            </div>
          )}

          {form.name && (
            <button
              onClick={() => setStep(2)}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
            >
              次へ進む
            </button>
          )}

          <button
            onClick={() => setStep(2)}
            className="w-full border border-dashed border-gray-300 bg-white text-gray-400 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            スキップして手入力
          </button>
        </div>
      )}

      {/* Step 2: 基本情報入力 */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-lg text-gray-800">基本情報を入力</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">食品名 *</label>
            <input type="text" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="例: 醤油、缶詰など"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <select value={form.category}
              onChange={(e) => setForm((f) => ({
                ...f,
                category: e.target.value as FormData['category'],
                is_disaster: e.target.value === 'disaster' ? true : f.is_disaster
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="condiment">調味料</option>
              <option value="disaster">防災備蓄</option>
              <option value="other">その他</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">保存場所</label>
              <input type="text" value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="例: 冷蔵庫"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
              <input type="number" value={form.quantity} min={1}
                onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">消費期限 *</label>
            <ExpiryInput
              value={form.expiry_date}
              onChange={(date) => setForm((f) => ({ ...f, expiry_date: date }))}
            />
          </div>

          {/* 通知設定 */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700">リマインドするタイミング</label>
            <div className="flex gap-2 flex-wrap">
              {NOTIFY_OPTIONS.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, notify_days: days }))}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    form.notify_days === days
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300'
                  }`}
                >
                  {days}日前
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.send_email}
                onChange={(e) => setForm((f) => ({ ...f, send_email: e.target.checked }))}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">
                {userEmail ? `${userEmail} にメールを送りますか？` : 'メールでお知らせする'}
              </span>
            </label>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_disaster}
              onChange={(e) => setForm((f) => ({ ...f, is_disaster: e.target.checked }))}
              className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700">🛡️ 防災用備蓄として管理する</span>
          </label>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">
              戻る
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!form.name || !form.expiry_date}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40">
              確認へ
            </button>
          </div>
        </div>
      )}

      {/* Step 3: 確認 */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-lg text-gray-800">内容を確認</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {[
                ['食品名', form.name],
                ['カテゴリ', { condiment: '調味料', disaster: '防災備蓄', other: 'その他' }[form.category]],
                ['消費期限', form.expiry_date],
                ['保存場所', form.location || '未設定'],
                ['数量', String(form.quantity)],
                ['通知タイミング', `${form.notify_days}日前`],
                ['メール通知', form.send_email ? '送る' : '送らない'],
                ['防災備蓄', form.is_disaster ? '○' : '-'],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className="py-2 text-gray-500 w-32">{label}</td>
                  <td className="py-2 font-medium text-gray-800">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {submitError && (
            <div className="bg-red-50 rounded-lg p-3 text-xs text-red-700 break-all">{submitError}</div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(2)}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">
              戻る
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? '登録中...' : '登録する'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
