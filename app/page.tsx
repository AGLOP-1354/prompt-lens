'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, AlertCircle, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp, Copy, Check, Trophy, XCircle, BookmarkPlus } from 'lucide-react'

import { env } from '@/lib/env'
import { cn } from '@/lib/utils'
import { useAuth } from '@/src/context/AuthProvider'
import Notification from '@/src/components/ui/Notification'
import FloatingMenu from '@/src/components/layout/FloatingMenu'
import { Textarea } from '@/components/ui/Textarea'
import type { AnalysisResult } from '@/src/types/analysis'

const Home = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [prompt, setPrompt] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [isCopied, setIsCopied] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const { user, openLoginModal } = useAuth()

  useEffect(() => {
    setCharCount(prompt.length)
  }, [prompt])

  useEffect(() => {
    const savedPrompt = localStorage.getItem('prompt-lens-draft')
    if (savedPrompt) {
      setPrompt(savedPrompt)
    }
  }, [])

  useEffect(() => {
    if (prompt) {
      localStorage.setItem('prompt-lens-draft', prompt)
    }
  }, [prompt])

  const isInvalid = charCount > 0 && charCount < env.minPromptLength
  const isOverLimit = charCount > env.maxPromptLength

  const handleCopyPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('복사 실패:', error)
    }
  }

  const handleSaveResult = async () => {
    if (!user) {
      openLoginModal(() => handleSaveResult())
      return
    }

    if (!result || !prompt) {
      alert('저장할 데이터가 없습니다.')
      return
    }

    try {
      const historyPayload = {
        original_prompt: prompt,
        overall_score: result.overall_score,
        grade: result.grade,
        clarity_score: result.scores.clarity,
        specificity_score: result.scores.specificity,
        structure_score: result.scores.structure,
        completeness_score: result.scores.completeness,
        efficiency_score: result.scores.efficiency,
        summary: result.summary,
        improved_prompt: result.improved_prompt?.text,
        improvements: result.improved_prompt
          ? {
              changes: result.improved_prompt.changes,
              expected_score_improvement: result.improved_prompt.expected_score_improvement,
            }
          : undefined,
      }

      const historyRes = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyPayload),
      })

      if (!historyRes.ok) {
        throw new Error('분석 기록 저장 실패')
      }

      const shouldSavePrompt = confirm('프롬프트도 함께 저장하시겠습니까?')

      if (shouldSavePrompt) {
        const title = window.prompt('프롬프트 제목을 입력하세요:', prompt.slice(0, 50))
        if (title) {
          const promptPayload = {
            title,
            content: prompt,
            tags: [],
            is_favorite: false,
          }

          const promptRes = await fetch('/api/prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promptPayload),
          })

          if (!promptRes.ok) {
            throw new Error('프롬프트 저장 실패')
          }

          setShowNotification(true)
        }
      } else {
        setShowNotification(true)
      }
    } catch (error) {
      console.error('저장 오류:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  const handleAnalyze = async () => {
    if (isInvalid || isOverLimit || charCount === 0) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.')
      }

      setResult(data.data)
    } catch (error) {
      console.error('분석 오류:', error)

      let errorMessage = '분석 중 오류가 발생했습니다.'

      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          errorMessage = 'AI 응답 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        } else if (error.message.includes('API')) {
          errorMessage = 'API 연결에 실패했습니다. 인터넷 연결을 확인해주세요.'
        } else {
          errorMessage = error.message
        }
      }

      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-1/2 h-full bg-white relative border-r border-slate-200"
      >
        <div className="h-full p-8 flex flex-col">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="프롬프트를 입력하세요..."
            className={cn(
              "flex-1 resize-none text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none p-0",
              isInvalid && "text-red-600",
              isOverLimit && "text-orange-600"
            )}
            disabled={isLoading}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 flex items-center justify-between"
          >
            <div className={cn(
              "text-sm font-medium transition-colors",
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
          </motion.div>

          {/* subtle helper */}
          <p className="mt-2 text-xs text-slate-400">
            명확한 목적, 필요한 맥락, 기대 출력 형식을 함께 적어주세요.
          </p>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', damping: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAnalyze}
          disabled={isLoading || isInvalid || isOverLimit || charCount === 0}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2.5 font-semibold text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              프롬프트 분석하기
            </>
          )}
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-1/2 h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-auto"
      >
        <div className="h-full p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-24 h-24 rounded-full border-4 border-blue-200"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute top-0 left-0 w-24 h-24 rounded-full border-t-4 border-blue-600"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
              </motion.div>

              <motion.div
                className="mt-8 space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-xl text-slate-700 font-semibold text-center">
                  프롬프트 분석 중...
                </p>
                <motion.p
                  className="text-sm text-slate-500 text-center"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  AI가 5가지 기준으로 분석하고 있습니다
                </motion.p>
              </motion.div>

              <motion.div
                className="mt-8 space-y-2 w-full max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {['명확성 평가', '구체성 분석', '구조 검토', '완전성 확인', '효율성 측정'].map((step, i) => (
                  <motion.div
                    key={step}
                    className="flex items-center gap-3 px-4 py-2 bg-white/50 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.15 }}
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full bg-blue-600"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                    <span className="text-sm text-slate-600">{step}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ) : result ? (
            result.overall_score === -404 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center h-full"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-2xl w-full"
                >
                  <div className="bg-gradient-to-br from-red-50 via-orange-50 to-red-50 rounded-2xl border-2 border-red-300 p-10">
                    <div className="flex items-center justify-center mb-6">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: 'spring', duration: 0.8 }}
                        className="bg-red-100 rounded-full p-6"
                      >
                        <XCircle className="w-20 h-20 text-red-600" />
                      </motion.div>
                    </div>

                    <h2 className="text-3xl font-bold text-red-900 text-center mb-4">
                      분석할 수 없는 프롬프트입니다
                    </h2>

                    <div className="bg-white/80 rounded-xl p-6 mb-6 border border-red-200">
                      <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        사유
                      </h3>
                      <p className="text-red-900 leading-relaxed">
                        {result.error_message || '프롬프트가 유효하지 않습니다.'}
                      </p>
                    </div>

                    <div className="space-y-3 text-red-800">
                      <p className="font-semibold">올바른 프롬프트 작성 가이드:</p>
                      <ul className="space-y-2 ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>AI에게 요청할 명확한 작업이나 질문을 작성하세요</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>의미 있는 단어와 문장으로 구성하세요</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>욕설, 혐오 표현, 부적절한 내용을 포함하지 마세요</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>구체적인 맥락과 목적을 포함하세요</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              // Valid Prompt Results
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Compact Score Overview */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow border border-slate-200 p-6"
                >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text"
                    >
                      {result.overall_score}
                    </motion.div>
                    <div>
                      <div className="text-sm text-slate-500">종합 점수</div>
                      <div className="text-lg font-semibold text-slate-700">{result.grade}</div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSaveResult}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium"
                  >
                    <BookmarkPlus className="w-4 h-4 text-blue-600" />
                    저장하기
                  </motion.button>
                </div>

                {/* Compact Scores Grid */}
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(result.scores).map(([key, value]: [string, any], index) => {
                    const maxScore = key === 'clarity' || key === 'specificity' ? 25 :
                                    key === 'structure' || key === 'completeness' ? 20 : 10
                    const percentage = (value / maxScore) * 100
                    const label = key === 'clarity' ? '명확성' :
                                 key === 'specificity' ? '구체성' :
                                 key === 'structure' ? '구조화' :
                                 key === 'completeness' ? '완전성' : '효율성'

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="text-center"
                      >
                        <div className="text-xs text-slate-500 mb-1">{label}</div>
                        <div className="text-lg font-bold text-slate-900">{value}<span className="text-xs text-slate-500">/{maxScore}</span></div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.5 + index * 0.05, duration: 0.6 }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full"
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Overall Assessment */}
              {result.summary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow border border-slate-200 p-6"
                >
                  <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    종합 평가
                  </h3>
                  <p className="text-slate-700 leading-relaxed">{result.summary.overall_assessment}</p>
                </motion.div>
              )}

              {/* Key Strengths */}
              {result.summary && result.summary.key_strengths && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-xl shadow border border-slate-200 p-6"
                >
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    잘한 부분
                  </h3>
                  <ul className="space-y-2">
                    {result.summary.key_strengths.map((strength: string, index: number) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-2 text-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </motion.li>
                  ))}
                  </ul>
                </motion.div>
              )}

              {/* Perfect Prompt Praise - 개선점이 없을 때만 표시 */}
              {result.summary && (!result.summary.priority_improvements || result.summary.priority_improvements.length === 0) &&
               (!result.summary.action_items || result.summary.action_items.length === 0) &&
               !result.improved_prompt && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 rounded-xl border-2 border-amber-300 p-8"
                >
                  <div className="flex items-center justify-center mb-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.7, type: 'spring', duration: 0.8 }}
                    >
                      <Trophy className="w-16 h-16 text-amber-500" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-amber-900 text-center mb-3">
                    완벽한 프롬프트입니다! 🎉
                  </h3>
                  <p className="text-amber-800 text-center leading-relaxed">
                    이 프롬프트는 이미 매우 훌륭하게 작성되어 있어 추가적인 개선이 필요하지 않습니다.<br />
                    명확성, 구체성, 구조화가 모두 뛰어나며 AI가 정확하게 이해하고 실행할 수 있는 수준입니다.
                  </p>
                </motion.div>
              )}

              {/* Priority Improvements - 개선점이 있을 때만 표시 */}
              {result.summary && result.summary.priority_improvements && result.summary.priority_improvements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-xl shadow border border-slate-200 p-6"
                >
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    개선이 필요한 부분
                  </h3>
                  <ul className="space-y-2">
                    {result.summary.priority_improvements.map((improvement: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-start gap-2 text-slate-700"
                      >
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>{improvement}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Action Items - 개선점이 있을 때만 표시 */}
              {result.summary && result.summary.action_items && result.summary.action_items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6"
                >
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    즉시 적용 가능한 개선 방법
                  </h3>
                  <ul className="space-y-2">
                    {result.summary.action_items.map((item: string, index: number) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-start gap-2 text-slate-700"
                      >
                        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Improved Prompt - 개선된 프롬프트가 있을 때만 표시 */}
              {result.improved_prompt && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white rounded-xl shadow border border-slate-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      개선된 프롬프트
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-green-600 font-semibold">
                        +{result.improved_prompt.expected_score_improvement}점 향상 예상
                      </span>
                      <motion.button
                        onClick={() => handleCopyPrompt(result.improved_prompt?.text || '')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        title="프롬프트 복사"
                      >
                        <AnimatePresence mode="wait">
                          {isCopied ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Check className="w-5 h-5 text-green-600" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Copy className="w-5 h-5 text-slate-600" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{result.improved_prompt.text}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-700">주요 변경사항:</h4>
                    <ul className="space-y-1">
                      {result.improved_prompt.changes.map((change: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="text-blue-600">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
              </motion.div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-16 h-16 text-blue-600" />
                </div>
                <p className="text-xl text-slate-500 font-medium">
                  프롬프트를 입력하고<br />분석을 시작해보세요
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>

      <FloatingMenu />

      <Notification
        show={showNotification}
        message="저장이 성공했습니다!"
        linkText="확인하러 가기"
        linkHref="/history"
        onClose={() => setShowNotification(false)}
      />
    </div>
  )
}

export default Home