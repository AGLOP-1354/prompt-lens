'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Info, Github, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Menu Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center group hover:scale-110"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 100 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-8 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
              <div className="flex flex-col min-w-[200px]">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-6 py-4 hover:bg-blue-50 transition-colors group ${
                    pathname === '/' ? 'bg-blue-50' : ''
                  }`}
                >
                  <Sparkles className={`w-5 h-5 transition-colors ${
                    pathname === '/' ? 'text-blue-600' : 'text-slate-600 group-hover:text-blue-600'
                  }`} />
                  <span className={`font-medium transition-colors ${
                    pathname === '/' ? 'text-blue-600' : 'text-slate-700 group-hover:text-blue-600'
                  }`}>
                    분석
                  </span>
                </Link>
                <div className="h-px bg-slate-200" />
                <Link
                  href="/about"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-6 py-4 hover:bg-blue-50 transition-colors group ${
                    pathname === '/about' ? 'bg-blue-50' : ''
                  }`}
                >
                  <Info className={`w-5 h-5 transition-colors ${
                    pathname === '/about' ? 'text-blue-600' : 'text-slate-600 group-hover:text-blue-600'
                  }`} />
                  <span className={`font-medium transition-colors ${
                    pathname === '/about' ? 'text-blue-600' : 'text-slate-700 group-hover:text-blue-600'
                  }`}>
                    소개
                  </span>
                </Link>
                <div className="h-px bg-slate-200" />
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-4 hover:bg-blue-50 transition-colors group"
                >
                  <Github className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                  <span className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                    GitHub
                  </span>
                </a>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
