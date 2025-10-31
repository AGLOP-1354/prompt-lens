'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Mail, Calendar, Trash2, AlertTriangle, LogOut } from 'lucide-react'

import { useAuth } from '@/src/context/AuthProvider'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/src/components/auth/AuthGuard'
import FloatingMenu from '@/src/components/layout/FloatingMenu';
import { authedApiClient } from '@/lib/fetcher/customFetch'
import type { SavedPrompt, AnalysisHistory } from '@/src/types/database'
import ConfirmModal from '@/src/components/ui/ConfirmModal'
import InputModal from '@/src/components/ui/InputModal'
import Notification from '@/src/components/ui/Notification'

const SettingsContent = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<{ id: string; email: string | null; created_at?: string; user_metadata?: any } | null>(
    null
  )
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalAnalyses: 0,
    averageScore: 0,
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmPhraseOpen, setConfirmPhraseOpen] = useState(false)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [notifyMsg, setNotifyMsg] = useState('')

  useEffect(() => {
    const loadAll = async () => {
      try {
        type PromptsGetResponse = { success: boolean; data: { prompts: SavedPrompt[]; total: number } }
        type HistoryGetResponse = { success: boolean; data: { history: AnalysisHistory[]; total: number } }
        type MeResponse = { success: boolean; data: { id: string; email: string | null; created_at?: string; user_metadata?: any } }
        const [{ data: meData }, { data: promptsData }, { data: historyData }, { data: fullHistoryData }] =
          await Promise.all([
            authedApiClient.get<MeResponse>('/api/me'),
            authedApiClient.get<PromptsGetResponse>('/api/prompts?limit=1'),
            authedApiClient.get<HistoryGetResponse>('/api/history?limit=1'),
            authedApiClient.get<HistoryGetResponse>('/api/history?limit=1000'),
          ])

        if (meData.success) setProfile(meData.data)
        const avgScore =
          fullHistoryData.success && fullHistoryData.data.history.length > 0
            ? Math.round(
                fullHistoryData.data.history.reduce((sum: number, h: any) => sum + h.overall_score, 0) /
                  fullHistoryData.data.history.length
              )
            : 0

        setStats({
          totalPrompts: promptsData.success ? promptsData.data.total : 0,
          totalAnalyses: historyData.success ? historyData.data.total : 0,
          averageScore: avgScore,
        })
      } catch (error) {
        console.error('통계 로드 오류:', error)
      }
    }

    loadAll()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  const handleDeleteAccount = async () => {
    setConfirmOpen(true)
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '알 수 없음'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="h-full overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              설정
            </h1>
            <p className="text-slate-600 mt-2">계정 정보 및 통계를 확인하고 관리할 수 있습니다</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              계정 정보
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {profile?.user_metadata?.full_name || user?.user_metadata?.full_name || '사용자'}
                  </h3>
                  <p className="text-sm text-slate-500">PromptLens 사용자</p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-3 border-t border-slate-200">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm text-slate-500">이메일</div>
                  <div className="text-slate-800 font-medium">{profile?.email || user?.email || '알 수 없음'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-3 border-t border-slate-200">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm text-slate-500">가입일</div>
                  <div className="text-slate-800 font-medium">{formatDate(profile?.created_at || user?.created_at)}</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-6">사용 통계</h2>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{stats.totalPrompts}</div>
                <div className="text-sm text-slate-600">저장한 프롬프트</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-1">{stats.totalAnalyses}</div>
                <div className="text-sm text-slate-600">분석 횟수</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">{stats.averageScore}</div>
                <div className="text-sm text-slate-600">평균 점수</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-4">로그아웃</h2>
            <p className="text-slate-600 mb-4">현재 세션에서 로그아웃합니다</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              로그아웃
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-red-50 rounded-xl border border-red-200 p-6"
          >
            <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              위험 영역
            </h2>
            <p className="text-red-700 mb-4">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
              {isDeleting ? '삭제 중...' : '계정 삭제'}
            </motion.button>
          </motion.div>
        </div>
      </div>

      <FloatingMenu />

      <ConfirmModal
        open={confirmOpen}
        title="계정 삭제"
        description="정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        variant="danger"
        confirmLabel="계속"
        cancelLabel="취소"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          setConfirmPhraseOpen(true)
        }}
      />

      <InputModal
        open={confirmPhraseOpen}
        title="확인 문자 입력"
        description="계정 삭제를 확인하려면 '삭제'를 입력하세요."
        placeholder="삭제"
        confirmLabel="삭제"
        cancelLabel="취소"
        onClose={() => setConfirmPhraseOpen(false)}
        onConfirm={async (text) => {
          if (text !== '삭제') {
            setConfirmPhraseOpen(false)
            setNotifyMsg('계정 삭제가 취소되었습니다.')
            setNotifyOpen(true)
            return
          }
          setIsDeleting(true)
          try {
            await authedApiClient.delete<{ success: boolean }>('/api/account')
            await signOut()
            setNotifyMsg('계정이 삭제되었습니다.')
            setNotifyOpen(true)
            router.push('/')
          } catch {
            setNotifyMsg('계정 삭제 중 오류가 발생했습니다.')
            setNotifyOpen(true)
          } finally {
            setIsDeleting(false)
            setConfirmPhraseOpen(false)
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

const SettingsPage = () => {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  )
}

export default SettingsPage