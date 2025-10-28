import { NextRequest, NextResponse } from 'next/server'
import { callSolarAPI } from '@/src/lib/solar'
import { ANALYZER_SYSTEM_PROMPT, createAnalysisPrompt } from '@/src/lib/prompts/analyzer'
import type { AnalyzeRequest, AnalyzeResponse, AnalysisResult } from '@/src/types/analysis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 환경 변수 검증
function validateEnvironment() {
  if (!process.env.UPSTAGE_API_KEY) {
    throw new Error('UPSTAGE_API_KEY environment variable is not set')
  }
}

// 프롬프트 유효성 검증
function validatePrompt(prompt: string): { valid: boolean; error?: string } {
  const minLength = parseInt(process.env.NEXT_PUBLIC_MIN_PROMPT_LENGTH || '10', 10)
  const maxLength = parseInt(process.env.NEXT_PUBLIC_MAX_PROMPT_LENGTH || '5000', 10)

  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: '프롬프트를 입력해주세요.' }
  }

  if (prompt.length < minLength) {
    return { valid: false, error: `프롬프트는 최소 ${minLength}자 이상이어야 합니다.` }
  }

  if (prompt.length > maxLength) {
    return { valid: false, error: `프롬프트는 최대 ${maxLength}자까지 입력 가능합니다.` }
  }

  return { valid: true }
}

// JSON 파싱 및 검증 (개선된 버전)
function parseAnalysisResult(content: string): AnalysisResult {
  let jsonContent = content.trim()

  // 1. 코드 블록 제거 시도
  const jsonBlockMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonBlockMatch) {
    jsonContent = jsonBlockMatch[1].trim()
  } else {
    const codeBlockMatch = jsonContent.match(/```\s*([\s\S]*?)\s*```/)
    if (codeBlockMatch) {
      jsonContent = codeBlockMatch[1].trim()
    }
  }

  // 2. JSON 객체 추출 시도 (중괄호 기반)
  const jsonObjectMatch = jsonContent.match(/\{[\s\S]*\}/)
  if (jsonObjectMatch) {
    jsonContent = jsonObjectMatch[0]
  }

  // 3. 특수 문자 정리
  jsonContent = jsonContent
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 제어 문자 제거
    .trim()

  try {
    const parsed = JSON.parse(jsonContent)

    // 필수 필드 검증
    if (!parsed.overall_score || !parsed.grade || !parsed.scores || !parsed.feedback) {
      console.error('필수 필드 누락:', {
        hasOverallScore: !!parsed.overall_score,
        hasGrade: !!parsed.grade,
        hasScores: !!parsed.scores,
        hasFeedback: !!parsed.feedback,
      })
      throw new Error('분석 결과가 올바른 형식이 아닙니다.')
    }

    return parsed as AnalysisResult
  } catch (error) {
    console.error('❌ JSON 파싱 실패!')
    console.error('에러:', error)
    console.error('파싱 시도한 내용:', jsonContent)

    // 더 자세한 에러 메시지
    if (error instanceof SyntaxError) {
      throw new Error(`JSON 파싱 오류: ${error.message}. AI가 올바른 JSON 형식으로 응답하지 않았습니다.`)
    }

    throw new Error('AI 응답을 파싱하는 중 오류가 발생했습니다. 다시 시도해주세요.')
  }
}

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 검증
    validateEnvironment()

    // 요청 본문 파싱
    const body: AnalyzeRequest = await request.json()
    const { prompt } = body

    // 프롬프트 유효성 검증
    const validation = validatePrompt(prompt)
    if (!validation.valid) {
      return NextResponse.json<AnalyzeResponse>(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      )
    }

    const response = await callSolarAPI(
      [
        {
          role: 'system',
          content: ANALYZER_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: createAnalysisPrompt(prompt),
        },
      ],
      {
        temperature: 0.3, // 일관성과 정확성을 위해 낮은 temperature
        max_tokens: 4096,
        top_p: 0.9,
        timeout: 45000, // 45초 타임아웃
      }
    )

    // 응답 파싱
    const analysisResult = parseAnalysisResult(response)

    // 성공 응답
    return NextResponse.json<AnalyzeResponse>(
      {
        success: true,
        data: analysisResult,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('프롬프트 분석 오류:', error)

    const errorMessage =
      error instanceof Error ? error.message : '프롬프트 분석 중 오류가 발생했습니다.'

    return NextResponse.json<AnalyzeResponse>(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
