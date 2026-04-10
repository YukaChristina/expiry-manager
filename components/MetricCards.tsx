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
    { label: '登録数', value: total, color: 'bg-indigo-50 text-indigo-700' },
    { label: '期限切れ', value: expired, color: 'bg-red-50 text-red-700' },
    { label: '30日以内', value: within30, color: 'bg-orange-50 text-orange-700' },
    { label: '防災備蓄数', value: disaster, color: 'bg-green-50 text-green-700' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl p-4 ${card.color}`}>
          <p className="text-2xl font-bold">{card.value}</p>
          <p className="text-sm mt-1">{card.label}</p>
        </div>
      ))}
    </div>
  )
}
