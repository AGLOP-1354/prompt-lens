'use client'

import { motion } from 'framer-motion'
import { Target, BarChart3, Lightbulb, Zap } from 'lucide-react'
import FloatingMenu from '@/src/components/layout/FloatingMenu'

const features = [
  {
    icon: Target,
    title: '5가지 평가 지표',
    description: '명확성, 구체성, 구조화, 완전성, 효율성',
  },
  {
    icon: BarChart3,
    title: '객관적 점수',
    description: '100점 만점 점수와 등급 제공',
  },
  {
    icon: Lightbulb,
    title: '개선 제안',
    description: '실질적인 개선 방향 제시',
  },
  {
    icon: Zap,
    title: '즉시 분석',
    description: '5초 이내 상세 결과',
  },
]

export default function AboutPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      <div className="w-full h-full overflow-y-auto">
        <div className="min-h-screen flex flex-col items-center justify-center px-8 py-20">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto text-center mb-20"
          >
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 leading-tight mb-6">
              PromptLens
            </h1>
            <p className="text-2xl md:text-3xl text-slate-600 mb-4">
              AI 프롬프트를 객관적으로 평가하세요
            </p>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              다각도 분석과 실질적인 개선 방향 제시
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-20"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* How it Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
              <h2 className="text-3xl font-bold text-slate-900 mb-8">
                간단한 3단계
              </h2>
              <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    1
                  </div>
                  <span className="text-slate-700 font-medium">프롬프트 입력</span>
                </div>
                <div className="hidden md:block text-slate-300 text-2xl">→</div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    2
                  </div>
                  <span className="text-slate-700 font-medium">분석 실행</span>
                </div>
                <div className="hidden md:block text-slate-300 text-2xl">→</div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    3
                  </div>
                  <span className="text-slate-700 font-medium">결과 확인</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <FloatingMenu />
    </div>
  )
}
