'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History,
  Trash2,
  Calendar,
  TrendingUp,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  X,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import AuthGuard from '@/src/components/auth/AuthGuard'
import FloatingMenu from '@/src/components/layout/FloatingMenu'
import { authedApiClient } from '@/lib/fetcher/customFetch'
import type { AnalysisHistory } from '@/src/types/database'
import ConfirmModal from '@/src/components/ui/ConfirmModal'
import Notification from '@/src/components/ui/Notification'

const HistoryContent = () => {
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedHistory, setSelectedHistory] = useState<AnalysisHistory | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [notifyMsg, setNotifyMsg] = useState('')

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      type HistoryGetResponse = { success: boolean; data: { history: AnalysisHistory[]; total: number }, error?: string }
      const { data } = await authedApiClient.get<HistoryGetResponse>('/api/history')

      if (data.success) {
        setHistory(data.data.history)
      } else {
        console.error('분석 기록 로드 실패:', data.error)
      }
    } catch (error) {
      console.error('분석 기록 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const deleteHistory = async (id: string) => {
    setDeleteTargetId(id)
    setConfirmOpen(true)
  }

  const copyPrompt = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('복사 실패:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Excellent':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'Good':
        return 'text-lime-600 bg-lime-50 border-lime-200'
      case 'Fair':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Poor':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'Very Poor':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  const getGradeKorean = (grade: string) => {
    switch (grade) {
      case 'Excellent':
        return '탁월함'
      case 'Good':
        return '우수함'
      case 'Fair':
        return '보통'
      case 'Poor':
        return '미흡함'
      case 'Very Poor':
        return '매우 미흡함'
      default:
        return grade
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="h-full flex flex-col md:flex-row">
        {/* 리스트 영역 - 모바일에서는 전체 화면, 데스크톱에서는 왼쪽 절반 */}
        <div className="w-full md:w-1/2 h-full border-r border-slate-200 flex flex-col bg-white">
          <div className="p-4 md:p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                <History className="w-5 h-5 md:w-7 md:h-7 text-blue-600" />
                분석 기록
              </h1>
              <span className="text-xs md:text-sm text-slate-500">{history.length}개</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3 md:p-4 space-y-2 pb-20 md:pb-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-blue-600 animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mb-4" />
                <p className="text-sm md:text-base text-slate-500">분석 기록이 없습니다</p>
              </div>
            ) : (
              <AnimatePresence>
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => setSelectedHistory(item)}
                    className={cn(
                      'p-3 md:p-4 rounded-lg border cursor-pointer transition-all touch-manipulation',
                      selectedHistory?.id === item.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl md:text-2xl font-bold text-slate-800">{item.overall_score}</span>
                          <span className={cn('px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs font-semibold border', getGradeColor(item.grade))}>
                            {getGradeKorean(item.grade)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-slate-600 line-clamp-2 mb-2">{item.original_prompt}</p>
                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* 상세 영역 - 모바일에서는 숨김, 데스크톱에서는 오른쪽 절반 */}
        <div className="hidden md:flex w-1/2 h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          {selectedHistory ? (
            <div className="h-full overflow-auto p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                          {selectedHistory.overall_score}
                        </span>
                        <div>
                          <div className="text-sm text-slate-500">종합 점수</div>
                          <div className={cn('text-lg font-semibold', getGradeColor(selectedHistory.grade))}>
                            {getGradeKorean(selectedHistory.grade)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteHistory(selectedHistory.id)}
                      className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-red-50 hover:border-red-300 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-5 h-5 text-slate-600 hover:text-red-600" />
                    </motion.button>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedHistory.created_at)}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">세부 점수</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { label: '명확성', score: selectedHistory.clarity_score, max: 25 },
                      { label: '구체성', score: selectedHistory.specificity_score, max: 25 },
                      { label: '구조화', score: selectedHistory.structure_score, max: 20 },
                      { label: '완전성', score: selectedHistory.completeness_score, max: 20 },
                      { label: '효율성', score: selectedHistory.efficiency_score, max: 10 },
                    ].map((item, index) => {
                      const percentage = (item.score / item.max) * 100
                      return (
                        <div key={item.label} className="text-center">
                          <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                          <div className="text-lg font-bold text-slate-900">
                            {item.score}<span className="text-xs text-slate-500">/{item.max}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: index * 0.05, duration: 0.6 }}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">원본 프롬프트</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyPrompt(selectedHistory.original_prompt, selectedHistory.id + '-original')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      {copiedId === selectedHistory.id + '-original' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                    </motion.button>
                  </div>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {selectedHistory.original_prompt}
                  </p>
                </div>

                {selectedHistory.summary && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      종합 평가
                    </h3>
                    <p className="text-slate-700 leading-relaxed">{selectedHistory.summary.overall_assessment}</p>
                  </div>
                )}

                {selectedHistory.summary?.key_strengths && selectedHistory.summary.key_strengths.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      잘한 부분
                    </h3>
                    <ul className="space-y-2">
                      {selectedHistory.summary.key_strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedHistory.summary?.priority_improvements && selectedHistory.summary.priority_improvements.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      개선이 필요한 부분
                    </h3>
                    <ul className="space-y-2">
                      {selectedHistory.summary.priority_improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedHistory.improved_prompt && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        개선된 프롬프트
                      </h3>
                      <div className="flex items-center gap-2">
                        {selectedHistory.improvements?.expected_score_improvement && (
                          <span className="text-sm text-green-600 font-semibold">
                            +{selectedHistory.improvements.expected_score_improvement}점 향상 예상
                          </span>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyPrompt(selectedHistory.improved_prompt!, selectedHistory.id + '-improved')}
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          {copiedId === selectedHistory.id + '-improved' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-slate-600" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selectedHistory.improved_prompt}
                      </p>
                    </div>
                    {selectedHistory.improvements?.changes && selectedHistory.improvements.changes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-slate-700">주요 변경사항:</h4>
                        <ul className="space-y-1">
                          {selectedHistory.improvements.changes.map((change, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="text-blue-600">•</span>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <History className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">
                  분석 기록을 선택하여<br />상세 내용을 확인하세요
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 모바일 Drawer */}
      <AnimatePresence>
        {selectedHistory && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHistory(null)}
              className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[70] md:hidden max-h-[90vh] flex flex-col"
            >
              {/* Drawer 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                    {selectedHistory.overall_score}
                  </span>
                  <span className={cn('px-2 py-1 rounded text-xs font-semibold border', getGradeColor(selectedHistory.grade))}>
                    {getGradeKorean(selectedHistory.grade)}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedHistory(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors touch-manipulation"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </motion.button>
              </div>

              {/* Drawer 내용 */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                <div className="flex items-center gap-3 text-xs text-slate-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedHistory.created_at)}</span>
                </div>

                {/* 세부 점수 */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <h3 className="text-xs font-semibold text-slate-700 mb-3">세부 점수</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: '명확성', score: selectedHistory.clarity_score, max: 25 },
                      { label: '구체성', score: selectedHistory.specificity_score, max: 25 },
                      { label: '구조화', score: selectedHistory.structure_score, max: 20 },
                      { label: '완전성', score: selectedHistory.completeness_score, max: 20 },
                      { label: '효율성', score: selectedHistory.efficiency_score, max: 10 },
                    ].map((item, index) => {
                      const percentage = (item.score / item.max) * 100
                      return (
                        <div key={item.label} className="text-center">
                          <div className="text-[10px] text-slate-500 mb-1">{item.label}</div>
                          <div className="text-sm font-bold text-slate-900">
                            {item.score}<span className="text-[10px] text-slate-500">/{item.max}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ delay: index * 0.05, duration: 0.6 }}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1 rounded-full"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 원본 프롬프트 */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-slate-700">원본 프롬프트</h3>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyPrompt(selectedHistory.original_prompt, selectedHistory.id + '-original')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors touch-manipulation"
                    >
                      {copiedId === selectedHistory.id + '-original' ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-600" />
                      )}
                    </motion.button>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {selectedHistory.original_prompt}
                  </p>
                </div>

                {/* 종합 평가 */}
                {selectedHistory.summary && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      종합 평가
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed">{selectedHistory.summary.overall_assessment}</p>
                  </div>
                )}

                {/* 잘한 부분 */}
                {selectedHistory.summary?.key_strengths && selectedHistory.summary.key_strengths.length > 0 && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      잘한 부분
                    </h3>
                    <ul className="space-y-1.5">
                      {selectedHistory.summary.key_strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 개선이 필요한 부분 */}
                {selectedHistory.summary?.priority_improvements && selectedHistory.summary.priority_improvements.length > 0 && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-orange-600" />
                      개선이 필요한 부분
                    </h3>
                    <ul className="space-y-1.5">
                      {selectedHistory.summary.priority_improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-slate-700">
                          <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 개선된 프롬프트 */}
                {selectedHistory.improved_prompt && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-blue-600" />
                        개선된 프롬프트
                      </h3>
                      <div className="flex items-center gap-2">
                        {selectedHistory.improvements?.expected_score_improvement && (
                          <span className="text-[10px] text-green-600 font-semibold">
                            +{selectedHistory.improvements.expected_score_improvement}점
                          </span>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyPrompt(selectedHistory.improved_prompt!, selectedHistory.id + '-improved')}
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors touch-manipulation"
                        >
                          {copiedId === selectedHistory.id + '-improved' ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-600" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 mb-2 border border-slate-200">
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selectedHistory.improved_prompt}
                      </p>
                    </div>
                    {selectedHistory.improvements?.changes && selectedHistory.improvements.changes.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-semibold text-slate-700">주요 변경사항:</h4>
                        <ul className="space-y-1">
                          {selectedHistory.improvements.changes.map((change, index) => (
                            <li key={index} className="flex items-start gap-2 text-[10px] text-slate-600">
                              <span className="text-blue-600">•</span>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 액션 버튼들 */}
                <div className="flex gap-2 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyPrompt(selectedHistory.original_prompt, selectedHistory.id + '-original')}
                    className="flex-1 px-4 py-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 touch-manipulation"
                  >
                    {copiedId === selectedHistory.id + '-original' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                    <span className="text-xs font-medium">
                      {copiedId === selectedHistory.id + '-original' ? '복사됨' : '원본 복사'}
                    </span>
                  </motion.button>
                  {selectedHistory.improved_prompt && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyPrompt(selectedHistory.improved_prompt!, selectedHistory.id + '-improved')}
                      className="flex-1 px-4 py-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 touch-manipulation"
                    >
                      {copiedId === selectedHistory.id + '-improved' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                      <span className="text-xs font-medium">
                        {copiedId === selectedHistory.id + '-improved' ? '복사됨' : '개선본 복사'}
                      </span>
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteHistory(selectedHistory.id)}
                    className="px-4 py-3 rounded-lg bg-white border border-red-300 hover:bg-red-50 transition-colors flex items-center justify-center touch-manipulation"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FloatingMenu />

      <ConfirmModal
        open={confirmOpen}
        title="분석 기록 삭제"
        description="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        variant="danger"
        confirmLabel="삭제"
        cancelLabel="취소"
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          if (!deleteTargetId) return setConfirmOpen(false)
          try {
            await authedApiClient.delete(`/api/history/${deleteTargetId}`)
            setHistory((prev) => prev.filter((h) => h.id !== deleteTargetId))
            setSelectedHistory(null)
            setNotifyMsg('분석 기록이 삭제되었습니다.')
            setNotifyOpen(true)
          } catch {
            setNotifyMsg('삭제 중 오류가 발생했습니다.')
            setNotifyOpen(true)
          } finally {
            setConfirmOpen(false)
            setDeleteTargetId(null)
          }
        }}
      />

      <Notification
        show={notifyOpen}
        message={notifyMsg}
        onClose={() => setNotifyOpen(false)}
      />
    </div>
  )
}

const HistoryPage = () => {
  return (
    <AuthGuard>
      <HistoryContent />
    </AuthGuard>
  )
}

export default HistoryPage
