'use client'

import { useState } from 'react'
import type { Item } from '@/lib/supabase'
import DetailModal from './DetailModal'

const CATEGORY_LABEL: Record<string, string> = {
  condiment: '調味料',
  disaster: '防災備蓄',
  other: 'その他',
}

function getDaysLeft(expiryDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  return Math.round((expiry.getTime() - today.getTime()) / 86400000)
}

function getBadgeColor(days: number) {
  if (days < 0) return 'bg-red-100 text-red-700'
  if (days <= 14) return 'bg-red-100 text-red-700'
  if (days <= 30) return 'bg-orange-100 text-orange-700'
  if (days <= 90) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

type Props = {
  items: Item[]
  onDelete: (id: string) => void
  onUpdate: (item: Item) => void
}

export default function ItemTable({ items, onDelete, onUpdate }: Props) {
  const [detailItem, setDetailItem] = useState<Item | null>(null)

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">🥫</p>
        <p>アイテムがありません</p>
        <a href="/items/new" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
          最初のアイテムを登録する
        </a>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">食品名</th>
              <th className="text-left px-4 py-3 font-medium">消費期限</th>
              <th className="text-left px-4 py-3 font-medium">残り日数</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">カテゴリ</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">保存場所</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">数量</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const days = getDaysLeft(item.expiry_date)
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {item.is_disaster && <span className="mr-1">🛡️</span>}
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.expiry_date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(days)}`}>
                      {days < 0 ? `${Math.abs(days)}日超過` : `${days}日`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                    {CATEGORY_LABEL[item.category] ?? item.category}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{item.location ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setDetailItem(item)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs"
                      >
                        詳細
                      </button>
                      <button
                        onClick={() => { if (confirm('削除しますか？')) onDelete(item.id) }}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {detailItem && (
        <DetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onUpdate={(updated) => { onUpdate(updated); setDetailItem(null) }}
          onDelete={(id) => { onDelete(id); setDetailItem(null) }}
        />
      )}
    </>
  )
}
