# PromptLens - 프론트엔드 개발 명세서

## 1. 프로젝트 개요

### 1.1 기술 스택
- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: React Hooks + Context API
- **폼 관리**: React Hook Form
- **애니메이션**: Framer Motion
- **차트**: Recharts
- **아이콘**: Lucide React
- **컴포넌트**: Radix UI

### 1.2 프로젝트 구조
```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지
│   └── analysis/          # 분석 결과 페이지
│       └── page.tsx
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── forms/            # 폼 관련 컴포넌트
│   ├── charts/           # 차트 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── hooks/                # 커스텀 훅
├── lib/                  # 유틸리티 함수
├── types/                # TypeScript 타입 정의
└── constants/            # 상수 정의
```

## 2. 페이지 구성

### 2.1 메인 페이지 (`/`)
**기능**: 프롬프트 입력 및 분석 요청

**컴포넌트 구성**:
```typescript
// app/page.tsx
import PromptInput from '@/components/forms/PromptInput'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AnalysisButton from '@/components/forms/AnalysisButton'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PromptInput />
          <AnalysisButton />
        </div>
      </main>
      <Footer />
    </div>
  )
}
```

### 2.2 분석 결과 페이지 (`/analysis`)
**기능**: 분석 결과 표시 및 개선 제안

**컴포넌트 구성**:
```typescript
// app/analysis/page.tsx
import ScoreGauge from '@/components/charts/ScoreGauge'
import ScoreBreakdown from '@/components/charts/ScoreBreakdown'
import FeedbackSection from '@/components/ui/FeedbackSection'
import ImprovedPrompt from '@/components/ui/ImprovedPrompt'
import BackButton from '@/components/ui/BackButton'

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <div className="max-w-6xl mx-auto space-y-8">
          <ScoreGauge />
          <ScoreBreakdown />
          <FeedbackSection />
          <ImprovedPrompt />
        </div>
      </div>
    </div>
  )
}
```

## 3. 컴포넌트 설계

### 3.1 UI 컴포넌트

#### Button 컴포넌트
```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600",
        secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200",
        outline: "border border-secondary-300 bg-transparent hover:bg-secondary-50",
        ghost: "hover:bg-secondary-100",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### Card 컴포넌트
```typescript
// components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-secondary-200 bg-white text-secondary-950 shadow-sm",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
```

### 3.2 폼 컴포넌트

#### PromptInput 컴포넌트
```typescript
// components/forms/PromptInput.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { cn } from '@/lib/utils'

interface PromptFormData {
  prompt: string
}

interface PromptInputProps {
  onSubmit: (data: PromptFormData) => void
  isLoading?: boolean
}

export default function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [charCount, setCharCount] = useState(0)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PromptFormData>()

  const promptValue = watch('prompt', '')

  useEffect(() => {
    setCharCount(promptValue.length)
  }, [promptValue])

  // 로컬 스토리지 자동 저장
  useEffect(() => {
    const savedPrompt = localStorage.getItem('prompt-lens-draft')
    if (savedPrompt) {
      // 폼에 저장된 값 복원
    }
  }, [])

  useEffect(() => {
    if (promptValue) {
      localStorage.setItem('prompt-lens-draft', promptValue)
    }
  }, [promptValue])

  const isInvalid = charCount < 10
  const isOverLimit = charCount > 5000

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-lg font-medium">
          프롬프트를 입력하세요
        </Label>
        <Textarea
          id="prompt"
          placeholder="분석하고 싶은 프롬프트를 입력하세요..."
          className={cn(
            "min-h-[200px] resize-y",
            isInvalid && "border-red-300 focus:border-red-500",
            isOverLimit && "border-orange-300 focus:border-orange-500"
          )}
          {...register('prompt', {
            required: '프롬프트를 입력해주세요',
            minLength: {
              value: 10,
              message: '최소 10자 이상 입력해주세요'
            },
            maxLength: {
              value: 5000,
              message: '최대 5000자까지 입력 가능합니다'
            }
          })}
        />
        <div className="flex justify-between items-center text-sm">
          <div className={cn(
            "text-secondary-600",
            isInvalid && "text-red-600",
            isOverLimit && "text-orange-600"
          )}>
            {charCount} / 5,000자
          </div>
          {isInvalid && (
            <span className="text-red-600 text-sm">
              최소 10자 이상 입력해주세요
            </span>
          )}
        </div>
        {errors.prompt && (
          <p className="text-red-600 text-sm">{errors.prompt.message}</p>
        )}
      </div>
    </form>
  )
}
```

### 3.3 차트 컴포넌트

#### ScoreGauge 컴포넌트
```typescript
// components/charts/ScoreGauge.tsx
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ScoreGaugeProps {
  score: number
  className?: string
}

export default function ScoreGauge({ score, className }: ScoreGaugeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-score-excellent'
    if (score >= 75) return 'text-score-good'
    if (score >= 60) return 'text-score-fair'
    if (score >= 45) return 'text-score-poor'
    return 'text-score-very-poor'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 60) return 'Fair'
    if (score >= 45) return 'Poor'
    return 'Very Poor'
  }

  const circumference = 2 * Math.PI * 90 // 반지름 90
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div className="relative">
        <svg width="200" height="200" className="transform -rotate-90">
          {/* 배경 원 */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-secondary-200"
          />
          {/* 점수 원 */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className={getScoreColor(score)}
            initial={{ strokeDasharray, strokeDashoffset: circumference }}
            animate={{ strokeDasharray, strokeDashoffset }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </svg>
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            <div className="text-4xl font-bold text-secondary-900">
              {score}
            </div>
            <div className="text-sm text-secondary-600">점</div>
            <div className={cn("text-sm font-medium mt-1", getScoreColor(score))}>
              {getScoreLabel(score)}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
```

#### ScoreBreakdown 컴포넌트
```typescript
// components/charts/ScoreBreakdown.tsx
'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

interface ScoreData {
  category: string
  score: number
  fullMark: number
}

interface ScoreBreakdownProps {
  scores: {
    clarity: number
    specificity: number
    structure: number
    completeness: number
    efficiency: number
  }
}

export default function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  const data: ScoreData[] = [
    { category: '명확성', score: scores.clarity, fullMark: 25 },
    { category: '구체성', score: scores.specificity, fullMark: 25 },
    { category: '구조화', score: scores.structure, fullMark: 20 },
    { category: '완전성', score: scores.completeness, fullMark: 20 },
    { category: '효율성', score: scores.efficiency, fullMark: 10 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200"
    >
      <h3 className="text-xl font-semibold mb-4">평가 항목별 점수</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={90} domain={[0, 25]} />
            <Radar
              name="점수"
              dataKey="score"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
```

## 4. 상태 관리

### 4.1 분석 상태 관리
```typescript
// hooks/useAnalysis.ts
import { useState, useCallback } from 'react'

interface AnalysisResult {
  overallScore: number
  scores: {
    clarity: number
    specificity: number
    structure: number
    completeness: number
    efficiency: number
  }
  feedback: {
    clarity: string
    specificity: string
    structure: string
    completeness: string
    efficiency: string
  }
  improvedPrompt: string
  improvements: string[]
}

interface UseAnalysisReturn {
  isLoading: boolean
  result: AnalysisResult | null
  error: string | null
  analyzePrompt: (prompt: string) => Promise<void>
  clearResult: () => void
}

export function useAnalysis(): UseAnalysisReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzePrompt = useCallback(async (prompt: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // API 호출 로직
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('분석 중 오류가 발생했습니다.')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return {
    isLoading,
    result,
    error,
    analyzePrompt,
    clearResult,
  }
}
```

## 5. API 통신

### 5.1 분석 API
```typescript
// lib/api.ts
export interface AnalyzeRequest {
  prompt: string
}

export interface AnalyzeResponse {
  overallScore: number
  scores: {
    clarity: number
    specificity: number
    structure: number
    completeness: number
    efficiency: number
  }
  feedback: {
    clarity: string
    specificity: string
    structure: string
    completeness: string
    efficiency: string
  }
  improvedPrompt: string
  improvements: string[]
}

export async function analyzePrompt(data: AnalyzeRequest): Promise<AnalyzeResponse> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('분석 요청에 실패했습니다.')
  }

  return response.json()
}
```

## 6. 타입 정의

### 6.1 기본 타입
```typescript
// types/index.ts
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
```

## 7. 유틸리티 함수

### 7.1 스타일 유틸리티
```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreGrade(score: number): ScoreGrade {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'fair'
  if (score >= 45) return 'poor'
  return 'very-poor'
}

export function getScoreColor(score: number): string {
  const grade = getScoreGrade(score)
  const colorMap = {
    excellent: 'text-score-excellent',
    good: 'text-score-good',
    fair: 'text-score-fair',
    poor: 'text-score-poor',
    'very-poor': 'text-score-very-poor',
  }
  return colorMap[grade]
}
```

### 7.2 로컬 스토리지 유틸리티
```typescript
// lib/storage.ts
export function savePromptDraft(prompt: string): void {
  localStorage.setItem('prompt-lens-draft', prompt)
}

export function getPromptDraft(): string | null {
  return localStorage.getItem('prompt-lens-draft')
}

export function clearPromptDraft(): void {
  localStorage.removeItem('prompt-lens-draft')
}

export function saveAnalysisHistory(analysis: PromptAnalysis): void {
  const history = getAnalysisHistory()
  const newHistory = [analysis, ...history].slice(0, 10) // 최대 10개 저장
  localStorage.setItem('prompt-lens-history', JSON.stringify(newHistory))
}

export function getAnalysisHistory(): PromptAnalysis[] {
  const history = localStorage.getItem('prompt-lens-history')
  return history ? JSON.parse(history) : []
}
```

## 8. 성능 최적화

### 8.1 코드 분할
```typescript
// 동적 임포트를 통한 코드 분할
const ScoreGauge = dynamic(() => import('@/components/charts/ScoreGauge'), {
  loading: () => <div className="animate-pulse bg-secondary-200 rounded-full w-48 h-48" />
})

const ScoreBreakdown = dynamic(() => import('@/components/charts/ScoreBreakdown'), {
  loading: () => <div className="animate-pulse bg-secondary-200 rounded-xl h-80" />
})
```

### 8.2 이미지 최적화
```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="PromptLens Logo"
  width={120}
  height={40}
  priority
/>
```

## 9. 접근성 구현

### 9.1 키보드 네비게이션
```typescript
// 키보드 이벤트 처리
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && event.ctrlKey) {
    handleSubmit()
  }
  if (event.key === 'Escape') {
    clearForm()
  }
}
```

### 9.2 스크린 리더 지원
```typescript
// ARIA 라벨 및 설명
<button
  aria-label="프롬프트 분석하기"
  aria-describedby="analysis-description"
>
  분석하기
</button>
<div id="analysis-description" className="sr-only">
  입력한 프롬프트를 분석하여 점수와 개선 제안을 제공합니다.
</div>
```

## 10. 테스트 전략

### 10.1 단위 테스트
```typescript
// __tests__/components/ScoreGauge.test.tsx
import { render, screen } from '@testing-library/react'
import ScoreGauge from '@/components/charts/ScoreGauge'

describe('ScoreGauge', () => {
  it('점수를 올바르게 표시한다', () => {
    render(<ScoreGauge score={85} />)
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('Good')).toBeInTheDocument()
  })
})
```

### 10.2 통합 테스트
```typescript
// __tests__/pages/analysis.test.tsx
import { render, screen } from '@testing-library/react'
import AnalysisPage from '@/app/analysis/page'

describe('AnalysisPage', () => {
  it('분석 결과를 올바르게 렌더링한다', () => {
    render(<AnalysisPage />)
    expect(screen.getByRole('heading', { name: /분석 결과/i })).toBeInTheDocument()
  })
})
```

## 11. 배포 설정

### 11.1 Next.js 설정
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['example.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

export default nextConfig
```

### 11.2 환경 변수
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=PromptLens
```

---

**문서 버전:** 1.0  
**최종 수정일:** 2025-01-27  
**작성자:** PromptLens Frontend Team
