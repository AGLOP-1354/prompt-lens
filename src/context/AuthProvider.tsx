'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/src/lib/supabaseClient'
import { env } from '@/src/lib/env'

type OAuthProvider = 'google' | 'kakao'

type AuthContextValue = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>
  signOut: () => Promise<void>
  // 로그인 모달 제어
  isLoginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient()
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: env.oauthRedirectUrl,
        // Kakao는 기본 scope로 충분. 필요 시 추가: 'profile_nickname', 'account_email' 등
        queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
      },
    })
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), [])
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    isLoading,
    signInWithOAuth,
    signOut,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
  }), [user, session, isLoading, signInWithOAuth, signOut, isLoginModalOpen, openLoginModal, closeLoginModal])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


