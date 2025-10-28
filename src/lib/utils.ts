import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ScoreGrade = 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor'

/**
 * Get score grade based on score value
 */
export function getScoreGrade(score: number): ScoreGrade {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  if (score >= 45) return 'poor'
  return 'very-poor'
}

/**
 * Get Tailwind color class based on score
 */
export function getScoreColor(score: number): string {
  const grade = getScoreGrade(score)
  const colorMap = {
    excellent: 'text-green-600',
    good: 'text-lime-600',
    fair: 'text-yellow-600',
    poor: 'text-orange-600',
    'very-poor': 'text-red-600',
  }
  return colorMap[grade]
}

/**
 * Get background color class based on score
 */
export function getScoreBgColor(score: number): string {
  const grade = getScoreGrade(score)
  const colorMap = {
    excellent: 'bg-green-100 border-green-300',
    good: 'bg-lime-100 border-lime-300',
    fair: 'bg-yellow-100 border-yellow-300',
    poor: 'bg-orange-100 border-orange-300',
    'very-poor': 'bg-red-100 border-red-300',
  }
  return colorMap[grade]
}

/**
 * Get grade label in Korean
 */
export function getScoreLabel(score: number): string {
  const grade = getScoreGrade(score)
  const labelMap = {
    excellent: '탁월함 (Excellent)',
    good: '우수함 (Good)',
    fair: '보통 (Fair)',
    poor: '미흡함 (Poor)',
    'very-poor': '매우 미흡함 (Very Poor)',
  }
  return labelMap[grade]
}
