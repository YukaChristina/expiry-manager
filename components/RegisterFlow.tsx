'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BarcodeScanner from './BarcodeScanner'
import ExpiryInput from './ExpiryInput'

type Step = 1 | 2 | 3

type FormData = {
  name: string
  category: 'condiment' | 'disaster' | 'other'
  expiry_date: string
  location: string
  quantity: number
  notify_days: number
  is_disaster: boolean
  barcode: string
}

const STEPS = ['スキャン', '情報入力', '確認']

export default function RegisterFlow() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [showScanner, setShowScanner] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
  const [form, setForm] = useState<FormData>({
    name: '',
    category: 'other',
    expiry_date: '',
    location: '',
    quantity: 1,
    notify_days: 14,
    is_disaster: false,
    barcode: '',
  })

  const handleBarcodeDetected = async (code: string) => {
    setShowScanner(false)
    setScanning(true)
    setForm((f) => ({ ...f, barcode: code }))

    try {
      const res = await fetch(`/api/scan/barcode?code=${code}`)
      const data = await res.json()
      setDebugInfo(`コード: ${code}\nレスポンス: ${JSON.stringify(data, null, 2)}`)
      if (data.found && data.name) {
        setForm((f) => ({ ...f, name: data.name }))
      }
    } catch (err) {
      setDebugInfo(`コード: ${code}\nエラー: ${String(err)}`)
    } finally {
      setScanning(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        router.push('/')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
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

      {/* Step 1: バーコードスキャン */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-lg text-gray-800">バーコードをスキャン</h2>
          <button
            onClick={() => setShowScanner(true)}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            <p className="text-3xl mb-2">📷</p>
            <p className="font-medium">バーコードをスキャン</p>
            <p className="text-sm mt-1">食品のJANコードを読み取ります</p>
          </button>
          {scanning && <p className="text-center text-sm text-indigo-600">商品情報を取得中...</p>}
          {debugInfo && (
            <pre className="bg-gray-100 rounded-lg p-3 text-xs text-gray-700 overflow-auto whitespace-pre-wrap">{debugInfo}</pre>
          )}
          {form.name && (
            <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700">
              ✓ 「{form.name}」が見つかりました
            </div>
          )}
          <button
            onClick={() => setStep(2)}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
          >
            {form.name ? '次へ進む' : 'スキップして手入力'}
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
                ['防災備蓄', form.is_disaster ? '○' : '-'],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td className="py-2 text-gray-500 w-32">{label}</td>
                  <td className="py-2 font-medium text-gray-800">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

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

      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
