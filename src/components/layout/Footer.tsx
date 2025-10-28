'use client'

import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="w-full border-t border-slate-200 bg-white py-8 mt-16"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>by PromptLens Team</span>
          </div>

          <p className="text-xs text-slate-500 max-w-2xl">
            PromptLens는 AI 프롬프트의 품질을 객관적으로 평가하고 개선 방향을 제시하는 도구입니다.
            <br />
            더 나은 프롬프트로 더 나은 AI 결과를 만들어보세요.
          </p>

          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              사용 가이드
            </a>
            <a
              href="#"
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              FAQ
            </a>
            <a
              href="#"
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              문의하기
            </a>
          </div>

          <p className="text-xs text-slate-400">
            © 2025 PromptLens. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}
