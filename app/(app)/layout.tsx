'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else {
        setEmail(session.user.email ?? '')
        setChecking(false)
      }
    })
  }, [router])

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center text-white/70 text-sm">
      読み込み中...
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* z-index:10 でヘッダーが瓦の上半分を覆う */}
      <header className="bg-[#1a2e52] shadow-md" style={{ position: 'relative', zIndex: 10 }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-lg font-bold text-white tracking-wide">
            蔵出し管理帳
          </a>
          <nav className="flex gap-4 text-sm items-center">
            <a href="/" className="text-[#93c5fd] hover:text-white transition-colors">一覧</a>
            <a
              href="/items/new"
              className="bg-[#C8553D] text-white px-3 py-1.5 rounded font-semibold hover:bg-[#b04a34] transition-colors text-xs tracking-wide"
            >
              ＋ 登録
            </a>
            <span className="text-[#64748b] text-xs hidden sm:inline">{email}</span>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
              className="text-[#64748b] hover:text-[#93c5fd] text-xs transition-colors"
            >
              ログアウト
            </button>
          </nav>
        </div>
      </header>

      {/*
        瓦シルエットボーダー（2段・互い違い・扁平かまぼこ型）
        - 上段(Row1): ヘッダー直下、下段(Row2): 半ピッチずれて重なる
        - marginTop:-4 で上段の上端がヘッダーに自然につながる
        - z-index:5 でヘッダー(z:10)の背後に描画
      */}
      <div
        aria-hidden="true"
        className="w-full"
        style={{ marginTop: -4, height: 40, position: 'relative', zIndex: 5 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="40" style={{ display: 'block' }}>
          <defs>
            <pattern id="kawara" x="0" y="0" width="84" height="44" patternUnits="userSpaceOnUse">
              {/* 下段（背面・半ピッチずれ） */}
              <path d="M-40,14 A40,18 0 0,1 40,14 Z" fill="#4A5568" />
              <path d="M-40,14 A40,18 0 0,1 40,14 Z" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="2.5" />
              <path d="M-40,14 A40,18 0 0,1 40,14" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
              <path d="M44,14 A40,18 0 0,1 124,14 Z" fill="#4A5568" />
              <path d="M44,14 A40,18 0 0,1 124,14 Z" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="2.5" />
              <path d="M44,14 A40,18 0 0,1 124,14" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
              {/* 上段（前面） */}
              <path d="M2,0 A40,18 0 0,1 82,0 Z" fill="#4A5568" />
              <path d="M2,0 A40,18 0 0,1 82,0 Z" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="2.5" />
              <path d="M2,0 A40,18 0 0,1 82,0" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="40" fill="url(#kawara)" />
        </svg>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
