export interface PromptAnalysis {
  id: string
  prompt: string
  timestamp: Date
  result: AnalysisResult
}

export interface AnalysisResult {
  overallScore: number
  scores: ScoreBreakdown
  feedback: FeedbackBreakdown
  improvedPrompt: string
  improvements: string[]
}

export interface ScoreBreakdown {
  clarity: number
  specificity: number
  structure: number
  completeness: number
  efficiency: number
}

export interface FeedbackBreakdown {
  clarity: string
  specificity: string
  structure: string
  completeness: string
  efficiency: string
}

export type ScoreGrade = 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor'

export interface ScoreGradeInfo {
  grade: ScoreGrade
  label: string
  color: string
  minScore: number
  maxScore: number
}
