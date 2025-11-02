'use client'

import { motion } from 'framer-motion'
import {
  Target,
  BarChart3,
  Lightbulb,
  Zap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Eye,
  FileText,
  Layers,
  Package,
  Minus,
  TrendingUp,
  Clock,
  Shield,
  Rocket,
} from 'lucide-react'
import Link from 'next/link'

import FloatingMenu from '@/src/components/layout/FloatingMenu'

const EVALUATION_CRITERIA = [
  {
    icon: Eye,
    title: '명확성 (Clarity)',
    score: '25점',
    description: '프롬프트의 목적과 의도가 명확한가?',
    details: [
      '목적이 한 문장으로 요약 가능한가?',
      '요청 사항이 구체적으로 기술되어 있는가?',
      '모호한 표현이나 중의적 해석의 여지는 없는가?',
    ],
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Target,
    title: '구체성 (Specificity)',
    score: '25점',
    description: '필요한 세부 정보가 충분히 포함되어 있는가?',
    details: [
      '출력 형식이 명시되어 있는가? (리스트, 문단, 표 등)',
      '분량이나 길이가 지정되어 있는가?',
      '톤앤매너나 스타일이 언급되어 있는가?',
    ],
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: Layers,
    title: '구조화 (Structure)',
    score: '20점',
    description: '논리적인 순서로 정보가 배열되어 있는가?',
    details: [
      '요청사항이 순서대로 나열되어 있는가?',
      '복잡한 작업이 단계로 구분되어 있는가?',
      '번호나 불릿 포인트로 정리되어 있는가?',
    ],
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Package,
    title: '완전성 (Completeness)',
    score: '20점',
    description: 'AI가 답변하는 데 필요한 모든 정보가 포함되어 있는가?',
    details: [
      '역할(role)이 정의되어 있는가?',
      '배경 맥락(context)이 제공되어 있는가?',
      '제약사항이나 금지사항이 명시되어 있는가?',
    ],
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: Minus,
    title: '효율성 (Efficiency)',
    score: '10점',
    description: '불필요한 반복이나 장황한 설명이 없는가?',
    details: [
      '같은 내용을 반복해서 설명하지 않는가?',
      '불필요한 수식어나 장황한 표현이 없는가?',
      '핵심만 간결하게 전달하는가?',
    ],
    color: 'from-orange-500 to-orange-600',
  },
]

const BENEFITS = [
  {
    icon: BarChart3,
    title: '객관적 평가',
    description: '100점 만점의 정확한 점수와 등급으로 프롬프트 품질을 객관적으로 측정합니다',
  },
  {
    icon: Lightbulb,
    title: '실질적 개선',
    description: 'AI가 분석한 구체적인 개선 방향과 개선된 프롬프트를 즉시 제공합니다',
  },
  {
    icon: Clock,
    title: '빠른 피드백',
    description: '5초 이내에 상세한 분석 결과와 개선 제안을 받아 바로 적용할 수 있습니다',
  },
  {
    icon: Shield,
    title: '무료 사용',
    description: '로그인 없이도 즉시 사용 가능하며, 모든 핵심 기능을 무료로 제공합니다',
  },
]

const STEPS = [
  {
    step: 1,
    title: '프롬프트 입력',
    description: '분석하고 싶은 AI 프롬프트를 텍스트 영역에 입력하세요',
  },
  {
    step: 2,
    title: '분석 실행',
    description: '"프롬프트 분석하기" 버튼을 클릭하여 즉시 분석을 시작합니다',
  },
  {
    step: 3,
    title: '결과 확인',
    description: '점수, 상세 피드백, 개선 제안을 확인하고 바로 적용하세요',
  },
]

const AboutPage = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="h-full overflow-y-auto">
        {/* 히어로 섹션 */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-12 md:mb-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 mb-6 md:mb-8">
              <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-4 md:mb-6">
              PromptLens
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-600 mb-4 md:mb-6">
              AI 프롬프트를 객관적으로 평가하세요
            </p>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto mb-8 md:mb-12">
              다각도 분석과 실질적인 개선 방향을 통해 더 효과적인 AI 활용을 지원합니다
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <span>지금 시작하기</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* 5가지 평가 지표 섹션 */}
        <section className="py-12 md:py-20 px-4 md:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                5가지 평가 지표
              </h2>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                프롬프트를 다각도로 분석하여 종합 점수를 산출합니다
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {EVALUATION_CRITERIA.map((criterion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-6 md:p-8 hover:shadow-lg transition-all"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${criterion.color} mb-4`}>
                    <criterion.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">
                      {criterion.title}
                    </h3>
                    <span className="text-sm md:text-base font-semibold text-blue-600 bg-blue-50 px-2 md:px-3 py-1 rounded-lg">
                      {criterion.score}
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-slate-600 mb-4">
                    {criterion.description}
                  </p>
                  <ul className="space-y-2">
                    {criterion.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2 text-xs md:text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 이점 섹션 */}
        <section className="py-12 md:py-20 px-4 md:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                PromptLens를 사용하면
              </h2>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                더 나은 프롬프트로 AI 활용 효과를 극대화하세요
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {BENEFITS.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 hover:shadow-lg transition-all"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl bg-blue-100 mb-4">
                    <benefit.icon className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 사용 방법 섹션 */}
        <section className="py-12 md:py-20 px-4 md:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                사용 방법
              </h2>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                간단한 3단계로 프롬프트 품질을 개선하세요
              </p>
            </motion.div>

            <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl border border-slate-200 p-6 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center">
                {STEPS.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    className="flex flex-col items-center text-center flex-1"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl md:text-3xl mb-4 md:mb-6 shadow-lg">
                      {step.step}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm md:text-base text-slate-600">
                      {step.description}
                    </p>
                    {index < STEPS.length - 1 && (
                      <ArrowRight className="hidden md:block w-8 h-8 text-slate-300 mt-4 md:mt-6 absolute md:relative right-auto md:right-0 translate-x-0 md:translate-x-12" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 md:mt-12 text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <Rocket className="w-5 h-5" />
                  <span>분석 시작하기</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 점수 등급 섹션 */}
        <section className="py-12 md:py-20 px-4 md:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                점수 등급
              </h2>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                100점 만점으로 프롬프트 품질을 평가합니다
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
              {[
                { range: '90-100점', grade: 'Excellent', label: '탁월함', color: 'from-green-500 to-green-600' },
                { range: '75-89점', grade: 'Good', label: '우수함', color: 'from-lime-500 to-lime-600' },
                { range: '60-74점', grade: 'Fair', label: '보통', color: 'from-yellow-500 to-yellow-600' },
                { range: '45-59점', grade: 'Poor', label: '미흡함', color: 'from-orange-500 to-orange-600' },
                { range: '0-44점', grade: 'Very Poor', label: '매우 미흡함', color: 'from-red-500 to-red-600' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 text-center hover:shadow-lg transition-all"
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${item.color} mx-auto mb-3 md:mb-4 flex items-center justify-center`}>
                    <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <div className="text-sm md:text-base font-semibold text-slate-900 mb-1">
                    {item.range}
                  </div>
                  <div className="text-lg md:text-xl font-bold text-slate-800 mb-2">
                    {item.label}
                  </div>
                  <div className="text-xs md:text-sm text-slate-500">
                    {item.grade}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <FloatingMenu />
    </div>
  )
}

export default AboutPage
