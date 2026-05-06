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

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
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
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-3 border border-[#c8d4e8] bg-white text-[#1a2e52] py-2.5 rounded font-semibold hover:bg-[#f8faff] disabled:opacity-50 text-sm transition-colors flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Googleでログイン
        </button>

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
