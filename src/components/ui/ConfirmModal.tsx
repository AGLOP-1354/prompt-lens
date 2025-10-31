'use client'

import { motion, AnimatePresence } from 'framer-motion'

type ConfirmModalProps = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'default',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const confirmClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-blue-600 hover:bg-blue-700'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 240 }}
            className="mx-4 w-full max-w-md rounded-xl bg-white p-5 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`px-3 py-2 rounded-lg text-white ${confirmClass}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


