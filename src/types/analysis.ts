// 분석 결과 타입 정의

export type ScoreGrade = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor' | 'Invalid'

export interface ScoreBreakdown {
  clarity: number
  specificity: number
  structure: number
  completeness: number
  efficiency: number
}

export interface CategoryFeedback {
  score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
}

export interface FeedbackBreakdown {
  clarity: CategoryFeedback
  specificity: CategoryFeedback
  structure: CategoryFeedback
  completeness: CategoryFeedback
  efficiency: CategoryFeedback
}

export interface AnalysisSummary {
  overall_assessment: string
  key_strengths: string[]
  priority_improvements?: string[] // Optional: 개선이 필요 없으면 빈 배열 또는 생략
  action_items?: string[] // Optional: 개선이 필요 없으면 빈 배열 또는 생략
}

export interface ImprovedPrompt {
  text: string
  changes: string[]
  expected_score_improvement: number
}

export interface AnalysisResult {
  overall_score: number // -404 = 무효한 프롬프트, 0-100 = 유효한 프롬프트
  grade: ScoreGrade
  scores: ScoreBreakdown
  feedback?: FeedbackBreakdown // Optional: 무효한 프롬프트면 null
  summary?: AnalysisSummary // Optional: 무효한 프롬프트면 null
  improved_prompt?: ImprovedPrompt // Optional: 개선이 필요 없거나 무효한 프롬프트면 생략
  error_message?: string // Optional: 무효한 프롬프트일 때 사유
}

export interface AnalyzeRequest {
  prompt: string
}

export interface AnalyzeResponse {
  success: boolean
  data?: AnalysisResult
  error?: string
}
