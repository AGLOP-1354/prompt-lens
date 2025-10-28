'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { env } from '@/lib/env'
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PromptFormData {
  prompt: string
}

interface PromptInputProps {
  onSubmit?: (data: PromptFormData) => void
  isLoading?: boolean
}

export default function PromptInput({ onSubmit, isLoading = false }: PromptInputProps) {
  const [charCount, setCharCount] = useState(0)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PromptFormData>({
    defaultValues: {
      prompt: ''
    }
  })

  const promptValue = watch('prompt', '')

  useEffect(() => {
    setCharCount(promptValue.length)
  }, [promptValue])

  // 로컬 스토리지 자동 저장
  useEffect(() => {
    const savedPrompt = localStorage.getItem('prompt-lens-draft')
    if (savedPrompt) {
      setValue('prompt', savedPrompt)
    }
  }, [setValue])

  useEffect(() => {
    if (promptValue) {
      localStorage.setItem('prompt-lens-draft', promptValue)
    }
  }, [promptValue])

  const isInvalid = charCount > 0 && charCount < env.minPromptLength
  const isOverLimit = charCount > env.maxPromptLength

  const handleFormSubmit = (data: PromptFormData) => {
    if (onSubmit) {
      onSubmit(data)
    } else {
      alert('프롬프트가 제출되었습니다!\n\n백엔드 연결 후 분석 결과가 표시됩니다.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-lg font-semibold text-slate-800">
            프롬프트를 입력하세요
          </Label>
          <Textarea
            id="prompt"
            placeholder="예시: '마케팅 캠페인을 위한 소셜 미디어 콘텐츠 아이디어를 10개 제시해주세요. 타겟 고객은 20-30대 직장인이며, 제품은 생산성 향상 앱입니다.'"
            className={cn(
              "min-h-[280px] resize-y text-base leading-relaxed",
              isInvalid && "border-red-400 focus:ring-red-500",
              isOverLimit && "border-orange-400 focus:ring-orange-500"
            )}
            disabled={isLoading}
            {...register('prompt', {
              required: '프롬프트를 입력해주세요',
              minLength: {
                value: env.minPromptLength,
                message: `최소 ${env.minPromptLength}자 이상 입력해주세요`
              },
              maxLength: {
                value: env.maxPromptLength,
                message: `최대 ${env.maxPromptLength.toLocaleString()}자까지 입력 가능합니다`
              }
            })}
          />

          <div className="flex justify-between items-center text-sm">
            <div className={cn(
              "font-medium transition-colors",
              charCount === 0 && "text-slate-400",
              charCount > 0 && charCount < env.minPromptLength && "text-red-600",
              charCount >= env.minPromptLength && charCount <= env.maxPromptLength && "text-slate-600",
              isOverLimit && "text-orange-600"
            )}>
              {charCount.toLocaleString()} / {env.maxPromptLength.toLocaleString()}자
            </div>

            <AnimatePresence>
              {isInvalid && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-red-600 text-sm flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  최소 {env.minPromptLength}자 이상 입력해주세요
                </motion.span>
              )}
              {isOverLimit && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-orange-600 text-sm flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  최대 {env.maxPromptLength.toLocaleString()}자까지 입력 가능합니다
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {errors.prompt && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.prompt.message}
            </motion.p>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || isInvalid || isOverLimit || charCount === 0}
            className="w-full text-base font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                프롬프트 분석하기
              </>
            )}
          </Button>
        </motion.div>

        <p className="text-sm text-slate-500 text-center">
          입력한 프롬프트는 자동으로 저장되며, 분석 후 삭제됩니다.
        </p>
      </form>
    </motion.div>
  )
}
