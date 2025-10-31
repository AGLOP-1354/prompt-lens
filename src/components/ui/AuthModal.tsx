'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

import { useAuth } from '@/src/context/AuthProvider'

const AuthModal = () => {
  const { isLoginModalOpen, closeLoginModal, signInWithOAuth } = useAuth()

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="PromptLens" className="h-6 w-6 rounded-sm" />
                  <h3 className="text-lg font-semibold text-slate-900">로그인</h3>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="닫기"
                  onClick={closeLoginModal}
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="px-6 pt-6 pb-4 text-center">
                <div className="mx-auto mb-3 flex items-center justify-center">
                  <img src="/logo.png" alt="PromptLens 로고" className="h-12 w-12 rounded-md shadow-sm" />
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  더 나은 프롬프트를 위한 첫 걸음,
                  <br />
                  <span className="font-semibold">PromptLens</span>와 함께하세요.
                </p>
              </div>

              <div className="px-6 pb-2">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs text-slate-400">간편 로그인</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
              </div>

              <div className="px-6 pb-6 space-y-3">
                <button
                  onClick={() => signInWithOAuth('google')}
                  className="w-full h-11 inline-flex items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium transition-colors"
                  aria-label="Google로 계속하기"
                >
                  <img src="/logo/google-logo.svg" alt="Google" className="h-5 w-5" />
                  <span>Google로 계속하기</span>
                </button>

                <button
                  onClick={() => signInWithOAuth('kakao')}
                  className="w-full h-11 inline-flex items-center justify-center gap-3 rounded-lg border border-amber-300 bg-amber-400 hover:bg-amber-300 text-[#2b1907] font-semibold transition-colors"
                  aria-label="카카오로 계속하기"
                >
                  <img src="/logo/kakao-logo.svg" alt="Kakao" className="h-5 w-5" />
                  <span>카카오로 계속하기</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center pt-1">
                  로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AuthModal
