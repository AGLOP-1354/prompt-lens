'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

type NotificationType = 'success' | 'warning' | 'error'

interface NotificationProps {
  show: boolean
  message: string
  type?: NotificationType
  linkText?: string
  linkHref?: string
  onClose: () => void
  duration?: number
}

export default function Notification({
  show,
  message,
  type = 'success',
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

  const getIconStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-100',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
        }
      case 'error':
        return {
          bg: 'bg-red-100',
          icon: X,
          iconColor: 'text-red-600',
        }
      default: // success
        return {
          bg: 'bg-green-100',
          icon: CheckCircle2,
          iconColor: 'text-green-600',
        }
    }
  }

  const iconStyles = getIconStyles()
  const Icon = iconStyles.icon

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
            <div className={`flex-shrink-0 w-10 h-10 ${iconStyles.bg} rounded-full flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${iconStyles.iconColor}`} />
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
