'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
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
          <p className="text-xs text-[#64748b] mt-1">新規アカウント登録</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1a2e52] mb-1">メールアドレス</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email"
              className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#3d5a9c]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1a2e52] mb-1">パスワード（6文字以上）</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={6} autoComplete="new-password"
              className="w-full border border-[#c8d4e8] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#3d5a9c]" />
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-[#1a2e52] text-white py-2.5 rounded font-semibold hover:bg-[#0f1d36] disabled:opacity-50 transition-colors text-sm">
            {loading ? '登録中...' : '登録する'}
          </button>
        </form>

        <p className="text-center text-xs text-[#94a3b8] mt-5">
          すでにアカウントをお持ちの方は{' '}
          <a href="/login" className="text-[#3d5a9c] hover:underline">ログイン</a>
        </p>
      </div>
    </div>
  )
}
