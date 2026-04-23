'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Item } from '@/lib/supabase'
import MetricCards from '@/components/MetricCards'
import ItemTable from '@/components/ItemTable'

const CATEGORIES = [
  { value: 'all', label: 'すべて' },
  { value: 'condiment', label: '調味料' },
  { value: 'disaster', label: '防災備蓄' },
  { value: 'other', label: 'その他' },
]

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const fetchItems = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (search) params.set('search', search)

    const res = await fetch(`/api/items?${params}`, {
      headers: { Authorization: `Bearer ${session?.access_token}` }
    })
    const data = await res.json()
    if (Array.isArray(data)) setItems(data)
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [category, search])

  const handleDelete = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch(`/api/items/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session?.access_token}` }
    })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleUpdate = (updated: Item) => {
    setItems((prev) => prev.map((i) => i.id === updated.id ? updated : i))
  }

  const handleExport = async (type: 'ics' | 'csv') => {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`/api/export/${type}`, {
      headers: { Authorization: `Bearer ${session?.access_token}` }
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = type === 'ics' ? 'expiry.ics' : 'expiry.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-wide">蔵の中身</h2>
        <div className="flex gap-2 text-sm items-center">
          <span className="text-white/50 text-xs">{items.length}件</span>
          <button onClick={() => handleExport('ics')} className="text-white/60 hover:text-white text-xs transition-colors">📅 .ics</button>
          <button onClick={() => handleExport('csv')} className="text-white/60 hover:text-white text-xs transition-colors">📄 CSV</button>
        </div>
      </div>

      <MetricCards items={items} />

      {/* 検索・フィルター */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="食品名で検索..."
          className="border border-[#c8d4e8] rounded px-3 py-2 text-sm flex-1 min-w-40 bg-white focus:outline-none focus:border-[#3d5a9c]"
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-2 rounded text-sm border transition-colors ${
                category === c.value
                  ? 'bg-[#1a2e52] text-white border-[#1a2e52]'
                  : 'bg-white text-[#64748b] border-[#c8d4e8] hover:border-[#3d5a9c]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/50 text-sm">読み込み中...</div>
      ) : (
        <ItemTable items={items} onDelete={handleDelete} onUpdate={handleUpdate} />
      )}
    </div>
  )
}
