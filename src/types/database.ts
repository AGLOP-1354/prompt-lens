/**
 * Database Types
 *
 * Supabase 데이터베이스 테이블의 TypeScript 타입 정의
 * 기존 테이블: profiles, prompt_analyses, analysis_feedback
 * 새로 추가: saved_prompts
 */

export interface SavedPrompt {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

// prompt_analyses 테이블 (기존 테이블)
export interface PromptAnalysis {
  id: string
  user_id: string
  original_prompt: string
  overall_score: number

  // 세부 점수
  clarity_score: number
  specificity_score: number
  structure_score: number
  completeness_score: number
  efficiency_score: number

  // 피드백 (개별 컬럼)
  clarity_feedback: string
  specificity_feedback: string
  structure_feedback: string
  completeness_feedback: string
  efficiency_feedback: string

  // 개선 제안
  improved_prompt: string
  improvements?: {
    changes?: string[]
    expected_score_improvement?: number
  }

  // 새로 추가된 컬럼
  grade: string // 'Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'
  summary?: {
    overall_assessment: string
    key_strengths: string[]
    priority_improvements: string[]
    action_items: string[]
  }
  is_saved: boolean
  saved_prompt_id?: string

  // 메타데이터
  analysis_version: string
  created_at: string
  updated_at: string
}

// Insert 타입 (자동 생성 필드 제외)
export type SavedPromptInsert = Omit<SavedPrompt, 'id' | 'created_at' | 'updated_at'>
export type PromptAnalysisInsert = Omit<PromptAnalysis, 'id' | 'created_at' | 'updated_at'>

// Update 타입 (일부 필드만 업데이트 가능)
export type SavedPromptUpdate = Partial<Omit<SavedPrompt, 'id' | 'user_id' | 'created_at'>>
export type PromptAnalysisUpdate = Partial<Pick<PromptAnalysis, 'is_saved' | 'saved_prompt_id' | 'summary'>>

// History 화면에서 사용하는 타입 별칭
export type AnalysisHistory = PromptAnalysis
