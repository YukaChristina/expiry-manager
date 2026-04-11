'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else setChecking(false)
    })
  }, [router])

  if (checking) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">読み込み中...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-gray-800">🥫 消費期限管理</a>
          <nav className="flex gap-4 text-sm items-center">
            <a href="/" className="text-gray-600 hover:text-gray-900">一覧</a>
            <a href="/items/new" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
              + 登録
            </a>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ログアウト
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
