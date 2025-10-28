'use client'

import { motion } from 'framer-motion'
import { Zap, Target, BarChart3, Lightbulb, CheckCircle2 } from 'lucide-react'
import FloatingMenu from '@/src/components/layout/FloatingMenu'
import { Card, CardContent } from '@/src/components/ui/Card'

const features = [
  {
    icon: Target,
    title: '5가지 평가 지표',
    description: '명확성, 구체성, 구조화, 완전성, 효율성을 종합적으로 분석합니다.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: BarChart3,
    title: '100점 만점 점수',
    description: '객관적인 점수와 등급으로 프롬프트 품질을 한눈에 확인하세요.',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: Lightbulb,
    title: '구체적인 개선 제안',
    description: 'AI가 분석한 개선점과 함께 향상된 프롬프트를 제공합니다.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    icon: Zap,
    title: '빠른 분석',
    description: '5초 이내에 상세한 분석 결과를 받아볼 수 있습니다.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
]

const benefits = [
  'AI 응답 품질 향상',
  '효율적인 토큰 사용',
  '명확한 의사소통',
  '시행착오 감소',
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
              AI 프롬프트의 품질을
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                객관적으로 평가하세요
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              PromptLens는 여러분의 프롬프트를 다각도로 분석하고,
              <br className="hidden md:block" />
              실질적인 개선 방향을 제시하는 AI 분석 도구입니다.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">{benefit}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              왜 PromptLens인가요?
            </h2>
            <p className="text-lg text-slate-600">
              프롬프트 엔지니어링의 모든 핵심 요소를 한 번에 분석합니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`${feature.bgColor} ${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="max-w-4xl mx-auto mt-20"
        >
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 border-0 shadow-2xl">
            <CardContent className="p-8 md:p-12 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                사용 방법
              </h2>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                프롬프트를 입력하고 분석 버튼을 누르기만 하면,
                3-5초 안에 상세한 분석 결과를 받아볼 수 있습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-3 text-blue-100">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                    1
                  </div>
                  <span>프롬프트 입력</span>
                </div>
                <div className="hidden sm:block text-blue-300">→</div>
                <div className="flex items-center gap-3 text-blue-100">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                    2
                  </div>
                  <span>분석 실행</span>
                </div>
                <div className="hidden sm:block text-blue-300">→</div>
                <div className="flex items-center gap-3 text-blue-100">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                    3
                  </div>
                  <span>결과 확인</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <FloatingMenu />
    </div>
  )
}
