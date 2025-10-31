'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'
import Link from 'next/link'

interface NotificationProps {
  show: boolean
  message: string
  linkText?: string
  linkHref?: string
  onClose: () => void
  duration?: number
}

export default function Notification({
  show,
  message,
  linkText,
  linkHref,
  onClose,
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full mx-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>

            <div className="flex-1">
              <p className="text-slate-800 font-medium">{message}</p>
              {linkText && linkHref && (
                <Link
                  href={linkHref}
                  onClick={onClose}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 mt-1"
                >
                  {linkText} →
                </Link>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
