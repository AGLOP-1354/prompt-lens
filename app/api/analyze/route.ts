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
  const firstBraceIdx = jsonContent.indexOf('{')
  const lastBraceIdx = jsonContent.lastIndexOf('}')
  if (firstBraceIdx !== -1) {
    if (lastBraceIdx !== -1 && lastBraceIdx > firstBraceIdx) {
      jsonContent = jsonContent.slice(firstBraceIdx, lastBraceIdx + 1)
    } else {
      // 닫는 중괄호가 누락된 경우: 시작 중괄호부터 끝까지 잘라낸 후 밸런스 맞추기
      jsonContent = jsonContent.slice(firstBraceIdx)
      const openCount = (jsonContent.match(/\{/g) || []).length
      const closeCount = (jsonContent.match(/\}/g) || []).length
      const missing = Math.max(0, openCount - closeCount)
      if (missing > 0) {
        jsonContent = jsonContent + '}'.repeat(missing)
      }
    }
  }

  // 3. 특수 문자 및 흔한 문법 오류 정리
  jsonContent = jsonContent
    // 스마트 따옴표를 일반 따옴표로
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    // 제어 문자 제거
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    // 배열/객체 닫힘 앞의 트레일링 콤마 제거
    .replace(/,(\s*[}\]])/g, '$1')
    .trim()

  try {
    const parsed = JSON.parse(jsonContent)

    // 필수 필드 검증 (overall_score와 grade는 항상 필요)
    if (parsed.overall_score === undefined || !parsed.grade || !parsed.scores) {
      console.error('필수 필드 누락:', {
        hasOverallScore: parsed.overall_score !== undefined,
        hasGrade: !!parsed.grade,
        hasScores: !!parsed.scores,
      })
      throw new Error('분석 결과가 올바른 형식이 아닙니다.')
    }

    // 무효한 프롬프트 (-404)인 경우 error_message만 확인
    if (parsed.overall_score === -404) {
      if (!parsed.error_message) {
        console.error('무효한 프롬프트이지만 error_message가 없습니다.')
        throw new Error('무효한 프롬프트에 대한 사유가 없습니다.')
      }
      return parsed as AnalysisResult
    }

    // 유효한 프롬프트인 경우 feedback과 summary 확인
    if (!parsed.feedback || !parsed.summary) {
      console.error('유효한 프롬프트이지만 필수 필드 누락:', {
        hasFeedback: !!parsed.feedback,
        hasSummary: !!parsed.summary,
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
