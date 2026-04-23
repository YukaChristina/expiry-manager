'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? ''
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? ''

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('メールアドレスまたはパスワードが違います')
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  const handleDemo = async () => {
    setLoading(true)
    setError('')
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })
    if (error) {
      setError('デモアカウントのログインに失敗しました')
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#F5F0E8] rounded border border-[#c8d4e8] shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-2xl mb-1">🏚️</p>
          <h1 className="text-xl font-bold text-[#1a2e52] tracking-wide">蔵出し管理帳</h1>
          <p className="text-xs text-[#64748b] mt-1">食品・備蓄品の蔵出し管理</p>
        </div>

        <button
          onClick={handleDemo}
          disabled={loading}
          className="w-full mb-4 border-2 border-[#3d5a9c] text-[#3d5a9c] py-2.5 rounded font-semibold hover:bg-[#eef2fa] disabled:opacity-50 text-sm transition-colors"
        >
          デモアカウントでログイン
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#c8d4e8]" />
          <span className="text-xs text-[#94a3b8]">または</span>
          <div className="flex-1 h-px bg-[#c8d4e8]" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1a2e52] mb-1">メールアドレス</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email"
              className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#3d5a9c]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1a2e52] mb-1">パスワード</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required autoComplete="current-password"
              className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#3d5a9c]" />
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-[#1a2e52] text-white py-2.5 rounded font-semibold hover:bg-[#0f1d36] disabled:opacity-50 transition-colors text-sm">
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <p className="text-center text-xs text-[#94a3b8] mt-5">
          アカウントをお持ちでない方は{' '}
          <a href="/signup" className="text-[#3d5a9c] hover:underline">新規登録</a>
        </p>
      </div>
    </div>
  )
}
