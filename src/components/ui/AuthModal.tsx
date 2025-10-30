'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuth } from '@/src/context/AuthProvider'

export default function AuthModal() {
  const { isLoginModalOpen, closeLoginModal, signInWithOAuth } = useAuth()

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <>
          {/* Dimmed background */}
          <motion.div
            className="fixed inset-0 z-[90] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
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
                <h3 className="text-lg font-semibold text-slate-900">로그인</h3>
                <button
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="닫기"
                  onClick={closeLoginModal}
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="px-6 pt-6 pb-3">
                <p className="text-slate-600 text-sm">
                  프롬프트 저장과 분석 기록 열람을 위해 로그인하세요.
                </p>
              </div>

              <div className="px-6 pb-6 space-y-3">
                <button
                  onClick={() => signInWithOAuth('google')}
                  className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium transition-colors"
                >
                  <span>Google로 계속하기</span>
                </button>

                <button
                  onClick={() => signInWithOAuth('kakao')}
                  className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-400 hover:bg-amber-300 text-[#2b1907] font-semibold transition-colors"
                >
                  <span>카카오로 계속하기</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


