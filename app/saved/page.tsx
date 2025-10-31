'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookmarkPlus,
  Star,
  Trash2,
  Copy,
  Check,
  Search,
  Tag as TagIcon,
  Calendar,
  Loader2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import AuthGuard from '@/src/components/auth/AuthGuard'
import FloatingMenu from '@/src/components/layout/FloatingMenu'
import { authedApiClient } from '@/lib/fetcher/customFetch'
import ConfirmModal from '@/src/components/ui/ConfirmModal'
import Notification from '@/src/components/ui/Notification'
import type { SavedPrompt } from '@/src/types/database'

const SavedPromptsContent = () => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterFavorite, setFilterFavorite] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [notifyMsg, setNotifyMsg] = useState('')

  const loadPrompts = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filterFavorite) params.append('favorite', 'true')

      type PromptsGetResponse = { success: boolean; data: { prompts: SavedPrompt[]; total: number }, error?: string }
      const { data } = await authedApiClient.get<PromptsGetResponse>(`/api/prompts?${params.toString()}`)

      if (data.success) {
        setPrompts(data.data.prompts)
      } else {
        console.error('프롬프트 로드 실패:', data.error)
      }
    } catch (error) {
      console.error('프롬프트 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPrompts()
  }, [filterFavorite])

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      searchQuery === '' ||
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesSearch
  })

  const toggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await authedApiClient.patch(`/api/prompts/${id}`, { is_favorite: !currentStatus })
      setPrompts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_favorite: !currentStatus } : p))
      )
    } catch (error) {
      console.error('즐겨찾기 토글 오류:', error)
    }
  }

  const deletePrompt = async (id: string) => {
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

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="h-full flex">
        <div className="w-1/2 h-full border-r border-slate-200 flex flex-col bg-white">
          <div className="p-6 border-b border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <BookmarkPlus className="w-7 h-7 text-blue-600" />
                저장한 프롬프트
              </h1>
              <span className="text-sm text-slate-500">{filteredPrompts.length}개</span>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterFavorite(!filterFavorite)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2',
                  filterFavorite
                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                )}
              >
                <Star className={cn('w-4 h-4', filterFavorite && 'fill-amber-500')} />
                즐겨찾기
              </motion.button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookmarkPlus className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-slate-500">
                  {searchQuery || filterFavorite ? '검색 결과가 없습니다' : '저장한 프롬프트가 없습니다'}
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredPrompts.map((prompt) => (
                  <motion.div
                    key={prompt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={() => setSelectedPrompt(prompt)}
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer transition-all',
                      selectedPrompt?.id === prompt.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-800 flex-1">{prompt.title}</h3>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(prompt.id, prompt.is_favorite)
                        }}
                      >
                        <Star
                          className={cn(
                            'w-5 h-5',
                            prompt.is_favorite
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 hover:text-amber-400'
                          )}
                        />
                      </motion.button>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">{prompt.content}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(prompt.created_at)}</span>
                      {prompt.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex gap-1">
                            {prompt.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {prompt.tags.length > 2 && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                +{prompt.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className="w-1/2 h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          {selectedPrompt ? (
            <div className="h-full overflow-auto p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-3xl font-bold text-slate-800">{selectedPrompt.title}</h2>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyPrompt(selectedPrompt.content, selectedPrompt.id)}
                        className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
                        title="프롬프트 복사"
                      >
                        {copiedId === selectedPrompt.id ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-slate-600" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deletePrompt(selectedPrompt.id)}
                        className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-red-50 hover:border-red-300 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-5 h-5 text-slate-600 hover:text-red-600" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedPrompt.created_at)}</span>
                    {selectedPrompt.updated_at !== selectedPrompt.created_at && (
                      <>
                        <span>•</span>
                        <span>수정됨: {formatDate(selectedPrompt.updated_at)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">프롬프트 내용</h3>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {selectedPrompt.content}
                  </p>
                </div>

                {selectedPrompt.tags.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <TagIcon className="w-4 h-4" />
                      태그
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrompt.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <BookmarkPlus className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">
                  프롬프트를 선택하여<br />상세 내용을 확인하세요
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <FloatingMenu />

      <ConfirmModal
        open={confirmOpen}
        title="프롬프트 삭제"
        description="정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        variant="danger"
        confirmLabel="삭제"
        cancelLabel="취소"
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          if (!deleteTargetId) return setConfirmOpen(false)
          try {
            await authedApiClient.delete(`/api/prompts/${deleteTargetId}`)
            setPrompts((prev) => prev.filter((p) => p.id !== deleteTargetId))
            setSelectedPrompt(null)
            setNotifyMsg('프롬프트가 삭제되었습니다.')
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

const SavedPromptsPage = () => {
  return (
    <AuthGuard>
      <SavedPromptsContent />
    </AuthGuard>
  )
}

export default SavedPromptsPage