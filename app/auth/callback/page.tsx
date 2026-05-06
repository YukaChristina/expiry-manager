'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/')
      } else if (event === 'SIGNED_OUT') {
        router.replace('/login')
      }
    })

    // 既にセッションが確立されている場合
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/')
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-[#64748b]">認証中...</p>
    </div>
  )
}
