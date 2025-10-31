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
  isLoginModalOpen: boolean
  openLoginModal: (onLoginSuccess?: () => void) => void
  closeLoginModal: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = getSupabaseClient()
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

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

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (event === 'SIGNED_IN' && newSession && pendingAction) {
        setIsLoginModalOpen(false)
        setTimeout(() => {
          pendingAction()
          setPendingAction(null)
        }, 100)
      }
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
        queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
      },
    })
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  const openLoginModal = useCallback((onLoginSuccess?: () => void) => {
    setIsLoginModalOpen(true)
    if (onLoginSuccess) {
      setPendingAction(() => onLoginSuccess)
    }
  }, [])

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false)
    setPendingAction(null)
  }, [])

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

const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { AuthProvider, useAuth }
