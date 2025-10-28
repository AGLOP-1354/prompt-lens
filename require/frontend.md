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
**기능**: 프롬프트 입력 및 실시간 결과 표시 (통합 화면)

**디자인 특징**:
- 헤더/푸터 없는 풀스크린 레이아웃
- 2단 분할 (입력 50%, 결과 50%)
- 플로팅 분석 버튼 및 메뉴

**컴포넌트 구성**:
```typescript
// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import FloatingMenu from '@/src/components/layout/FloatingMenu'
import { Textarea } from '@/components/ui/Textarea'
import { env } from '@/lib/env'
import { cn } from '@/lib/utils'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [prompt, setPrompt] = useState('')
  const [charCount, setCharCount] = useState(0)

  // 로컬 스토리지 자동 저장
  useEffect(() => {
    const savedPrompt = localStorage.getItem('prompt-lens-draft')
    if (savedPrompt) setPrompt(savedPrompt)
  }, [])

  useEffect(() => {
    if (prompt) localStorage.setItem('prompt-lens-draft', prompt)
  }, [prompt])

  const handleAnalyze = async () => {
    setIsLoading(true)
    // API 호출 로직
    // ...
    setIsLoading(false)
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex">
      {/* Left: Input Section */}
      <div className="w-1/2 h-full bg-white relative border-r border-slate-200">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="프롬프트를 입력하세요..."
          className="flex-1 resize-none"
        />

        {/* Floating Analyze Button */}
        <button
          onClick={handleAnalyze}
          className="absolute bottom-8 left-1/2 -translate-x-1/2
                     px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600
                     text-white rounded-full shadow-2xl"
        >
          <Sparkles className="w-6 h-6" />
          프롬프트 분석하기
        </button>
      </div>

      {/* Right: Results Section */}
      <div className="w-1/2 h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-auto">
        {/* 결과 표시 영역 */}
      </div>

      {/* Floating Menu */}
      <FloatingMenu />
    </div>
  )
}
```

### 2.2 소개 페이지 (`/about`)
**기능**: 서비스 소개 및 기능 설명

**컴포넌트 구성**:
```typescript
// app/about/page.tsx
'use client'

import { motion } from 'framer-motion'
import { Zap, Target, BarChart3, Lightbulb, CheckCircle2 } from 'lucide-react'
import FloatingMenu from '@/src/components/layout/FloatingMenu'
import { Card, CardContent } from '@/src/components/ui/Card'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          {/* 서비스 소개 콘텐츠 */}
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto">
          {/* 주요 기능 카드 */}
        </div>

        {/* How it works */}
        <div className="max-w-4xl mx-auto mt-20">
          {/* 사용 방법 안내 */}
        </div>
      </main>

      <FloatingMenu />
    </div>
  )
}
```

## 3. 컴포넌트 설계

### 3.1 레이아웃 컴포넌트

#### FloatingMenu 컴포넌트
```typescript
// components/layout/FloatingMenu.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Info, Github, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Menu Button - 우측 하단 고정 */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14
                   bg-gradient-to-br from-blue-600 to-indigo-600
                   text-white rounded-full shadow-2xl
                   hover:shadow-blue-500/50 transition-all duration-300
                   flex items-center justify-center hover:scale-110"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Menu Panel - 오버레이 없음 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 100 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-8 z-50
                       bg-white rounded-2xl shadow-2xl
                       border border-slate-200 overflow-hidden"
          >
            <div className="flex flex-col min-w-[200px]">
              <Link href="/" onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-6 py-4
                           hover:bg-blue-50 transition-colors group
                           ${pathname === '/' ? 'bg-blue-50' : ''}`}>
                <Sparkles className={`w-5 h-5 transition-colors
                  ${pathname === '/' ? 'text-blue-600' : 'text-slate-600 group-hover:text-blue-600'}`} />
                <span className={`font-medium transition-colors
                  ${pathname === '/' ? 'text-blue-600' : 'text-slate-700 group-hover:text-blue-600'}`}>
                  분석
                </span>
              </Link>

              <div className="h-px bg-slate-200" />

              <Link href="/about" onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-6 py-4
                           hover:bg-blue-50 transition-colors group
                           ${pathname === '/about' ? 'bg-blue-50' : ''}`}>
                <Info className={`w-5 h-5 transition-colors
                  ${pathname === '/about' ? 'text-blue-600' : 'text-slate-600 group-hover:text-blue-600'}`} />
                <span className={`font-medium transition-colors
                  ${pathname === '/about' ? 'text-blue-600' : 'text-slate-700 group-hover:text-blue-600'}`}>
                  소개
                </span>
              </Link>

              <div className="h-px bg-slate-200" />

              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-4 hover:bg-blue-50 transition-colors group">
                <Github className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                <span className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                  GitHub
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

### 3.2 UI 컴포넌트

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

### 3.2 입력 컴포넌트

#### 프롬프트 입력 (메인 페이지 통합)
메인 페이지에서 직접 Textarea 컴포넌트를 사용하여 라벨 없는 미니멀한 디자인 구현:

**주요 특징**:
- 별도의 PromptInput 컴포넌트 없이 페이지 레벨에서 상태 관리
- 라벨 제거, 플레이스홀더만 사용
- 실시간 글자 수 카운팅 및 유효성 검증
- 로컬 스토리지 자동 저장
- 하단 중앙에 플로팅 분석 버튼

**구현**:
```typescript
// 메인 페이지 내부에서 직접 구현
const [prompt, setPrompt] = useState('')
const [charCount, setCharCount] = useState(0)

useEffect(() => {
  setCharCount(prompt.length)
}, [prompt])

// 로컬 스토리지 저장/복원
useEffect(() => {
  const savedPrompt = localStorage.getItem('prompt-lens-draft')
  if (savedPrompt) setPrompt(savedPrompt)
}, [])

useEffect(() => {
  if (prompt) localStorage.setItem('prompt-lens-draft', prompt)
}, [prompt])

const isInvalid = charCount > 0 && charCount < env.minPromptLength
const isOverLimit = charCount > env.maxPromptLength

// Textarea 렌더링
<Textarea
  value={prompt}
  onChange={(e) => setPrompt(e.target.value)}
  placeholder="프롬프트를 입력하세요..."
  className={cn(
    "flex-1 resize-none text-lg border-0 focus-visible:ring-0",
    isInvalid && "text-red-600",
    isOverLimit && "text-orange-600"
  )}
  disabled={isLoading}
/>
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

**문서 버전:** 1.1
**최종 수정일:** 2025-10-29
**작성자:** PromptLens Frontend Team

## 변경 이력
- **v1.1 (2025-10-29)**:
  - 메인 페이지 구조 전면 개편 (풀스크린 2단 레이아웃)
  - FloatingMenu 컴포넌트 추가
  - PromptInput 컴포넌트 제거 (메인 페이지 통합)
  - About 페이지 추가
- **v1.0 (2025-01-27)**: 초기 문서 작성
