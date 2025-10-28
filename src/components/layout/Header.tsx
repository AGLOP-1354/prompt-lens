'use client'

import { Sparkles, Github } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                PromptLens
              </h1>
              <p className="text-xs text-slate-500">AI 프롬프트 품질 분석 도구</p>
            </div>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Github className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">
              GitHub
            </span>
          </a>
        </div>
      </div>
    </motion.header>
  )
}
