'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Lock } from 'lucide-react'

import { useAuth } from '@/src/context/AuthProvider'

interface AuthGuardProps {
  children: React.ReactNode
  fallbackPath?: string
}

const AuthGuard = ({ children, fallbackPath = '/' }: AuthGuardProps) => {
  const { user, isLoading, openLoginModal } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      openLoginModal()
      router.replace(fallbackPath)
    }
  }, [user, isLoading, router, fallbackPath, openLoginModal])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <div className="absolute inset-0 blur-xl bg-blue-400 opacity-20 animate-pulse" />
          </div>
          <p className="text-slate-600 font-medium">인증 확인 중...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">접근 권한이 필요합니다</h2>
            <p className="text-slate-600">로그인 후 이용해주세요</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}

export default AuthGuard