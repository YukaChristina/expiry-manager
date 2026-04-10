import RegisterFlow from '@/components/RegisterFlow'

export default function NewItemPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">アイテムを登録</h2>
        <p className="text-sm text-gray-500">バーコードをスキャンして食品情報を自動取得できます</p>
      </div>
      <RegisterFlow />
    </div>
  )
}
