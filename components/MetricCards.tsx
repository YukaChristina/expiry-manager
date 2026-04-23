import type { Item } from '@/lib/supabase'

type Props = { items: Item[] }

export default function MetricCards({ items }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysLeft = (item: Item) => {
    const expiry = new Date(item.expiry_date)
    return Math.round((expiry.getTime() - today.getTime()) / 86400000)
  }

  const total = items.length
  const expired = items.filter((i) => daysLeft(i) < 0).length
  const within30 = items.filter((i) => { const d = daysLeft(i); return d >= 0 && d <= 30 }).length
  const disaster = items.filter((i) => i.is_disaster).length

  const cards = [
    { label: '登録数', value: total, text: 'text-[#1a2e52]', sub: 'text-[#3d5a9c]' },
    { label: '期限切れ', value: expired, text: 'text-red-700', sub: 'text-red-400' },
    { label: '30日以内', value: within30, text: 'text-orange-700', sub: 'text-orange-500' },
    { label: '防災備蓄', value: disaster, text: 'text-[#2d5a1a]', sub: 'text-[#4a8a2d]' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded border border-[#c8b89a] bg-[#F5F0E8] p-3 shadow-sm text-center">
          <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
          <p className={`text-xs mt-1 ${card.sub}`}>{card.label}</p>
        </div>
      ))}
    </div>
  )
}
