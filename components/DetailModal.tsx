'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Item } from '@/lib/supabase'

type Props = {
  item: Item
  onClose: () => void
  onUpdate: (item: Item) => void
  onDelete: (id: string) => void
}

export default function DetailModal({ item, onClose, onUpdate, onDelete }: Props) {
  const [form, setForm] = useState({
    name: item.name,
    category: item.category,
    expiry_date: item.expiry_date,
    location: item.location ?? '',
    quantity: item.quantity,
    notify_days: item.notify_days,
    is_disaster: item.is_disaster,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(form),
    })
    const updated = await res.json()
    onUpdate(updated)
    setSaving(false)
  }

  const labelClass = 'block text-xs font-semibold text-[#1a2e52] mb-1'
  const inputClass = 'w-full border border-[#c8d4e8] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#3d5a9c]'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F5F0E8] rounded border border-[#c8d4e8] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#c8d4e8] bg-[#eef2fa]">
          <h3 className="font-bold text-[#1a2e52] tracking-wide">アイテム詳細</h3>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#1a2e52] text-lg transition-colors">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className={labelClass}>食品名</label>
            <input type="text" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>カテゴリ</label>
            <select value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Item['category'] }))}
              className={inputClass}>
              <option value="condiment">調味料</option>
              <option value="disaster">防災備蓄</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>消費期限</label>
            <input type="date" value={form.expiry_date}
              onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))}
              className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>保存場所</label>
              <input type="text" value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className={inputClass}
                placeholder="例: 冷蔵庫" />
            </div>
            <div>
              <label className={labelClass}>数量</label>
              <input type="number" value={form.quantity} min={1}
                onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>通知タイミング（期限の何日前）</label>
            <input type="number" value={form.notify_days} min={1}
              onChange={(e) => setForm((f) => ({ ...f, notify_days: Number(e.target.value) }))}
              className={inputClass} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_disaster}
              onChange={(e) => setForm((f) => ({ ...f, is_disaster: e.target.checked }))}
              className="w-4 h-4 rounded accent-[#3d5a9c]" />
            <span className="text-sm text-[#1a2e52]">防災用備蓄として管理</span>
          </label>
        </div>

        <div className="px-5 py-4 border-t border-[#c8d4e8] space-y-2">
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 border border-[#c8d4e8] text-[#64748b] py-2.5 rounded text-sm hover:bg-[#eef2fa] transition-colors">
              キャンセル
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-[#1a2e52] text-white py-2.5 rounded text-sm hover:bg-[#0f1d36] disabled:opacity-50 transition-colors">
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
          <button
            onClick={() => { if (confirm('削除しますか？')) onDelete(item.id) }}
            className="w-full border border-red-200 text-red-400 py-2 rounded text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            このアイテムを削除
          </button>
        </div>
      </div>
    </div>
  )
}
