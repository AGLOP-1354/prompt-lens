import { NextRequest, NextResponse } from 'next/server'

import { callSolarAPI } from '@/src/lib/solar'
import { headers, cookies } from 'next/headers'
import { createSupabaseAdminClient } from '@/src/lib/supabaseServer'
import { ANALYZER_SYSTEM_PROMPT, createAnalysisPrompt } from '@/src/lib/prompts/analyzer'
import type { AnalyzeRequest, AnalyzeResponse, AnalysisResult } from '@/src/types/analysis'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MIN_PROMPT_LENGTH: number = parseInt(
  process.env.NEXT_PUBLIC_MIN_PROMPT_LENGTH || '10',
  10
)
const MAX_PROMPT_LENGTH: number = parseInt(
  process.env.NEXT_PUBLIC_MAX_PROMPT_LENGTH || '5000',
  10
)

const validateEnvironment = (): void => {
  if (!process.env.UPSTAGE_API_KEY) {
    throw new Error('UPSTAGE_API_KEY environment variable is not set')
  }
}

const validatePrompt = (prompt: string): { valid: boolean; error?: string } => {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: '프롬프트를 입력해주세요.' }
  }

  if (prompt.length < MIN_PROMPT_LENGTH) {
    return { valid: false, error: `프롬프트는 최소 ${MIN_PROMPT_LENGTH}자 이상이어야 합니다.` }
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { valid: false, error: `프롬프트는 최대 ${MAX_PROMPT_LENGTH}자까지 입력 가능합니다.` }
  }

  return { valid: true }
}

const extractJsonBlock = (content: string): string => {
  const original = content.trim()
  const jsonBlockMatch = original.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonBlockMatch) return original.replace(/^[\s\S]*?```json\s*/, '').replace(/```[\s\S]*$/, '').trim()

  const codeBlockMatch = original.match(/```\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) return codeBlockMatch[1].trim()

  return original
}

const balanceJsonBraces = (raw: string): string => {
  const firstBraceIdx = raw.indexOf('{')
  if (firstBraceIdx === -1) return raw

  let jsonContent = raw.slice(firstBraceIdx)
  const openCount = (jsonContent.match(/\{/g) || []).length
  const closeCount = (jsonContent.match(/\}/g) || []).length

  if (openCount > closeCount) {
    const missing = openCount - closeCount
    jsonContent = jsonContent.trimEnd() + '}'.repeat(missing)
  } else if (closeCount > openCount) {
    let depth = 0
    let validEndIdx = jsonContent.length
    for (let i = 0; i < jsonContent.length; i++) {
      if (jsonContent[i] === '{') {
        depth++
      } else if (jsonContent[i] === '}') {
        depth--
        if (depth === 0) {
          validEndIdx = i + 1
          break
        }
      }
    }
    jsonContent = jsonContent.slice(0, validEndIdx)
  }

  return jsonContent
}

const sanitizeJsonString = (raw: string): string => {
  return raw
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/,(\s*[}\]])/g, '$1')
    .trim()
}

const hasCoreFields = (
  value: unknown
): value is { overall_score: number; grade: unknown; scores: unknown } => {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    'overall_score' in v && typeof v.overall_score === 'number' && 'grade' in v && 'scores' in v
  )
}

const fixUnterminatedString = (json: string): string => {
  let fixed = json

  let inString = false
  let escapeNext = false
  let stringStart = -1
  let problematicPos = -1
  
  for (let i = 0; i < json.length; i++) {
    const char = json[i]
    
    if (escapeNext) {
      escapeNext = false
      continue
    }

    if (char === '\\') {
      escapeNext = true
      continue
    }

    if (char === '"') {
      if (!inString) {
        // 문자열 시작
        inString = true
        stringStart = i
      } else {
        // 문자열 종료
        inString = false
        stringStart = -1
      }
      continue
    }

    if (inString) {
      // 문자열 내부에서 문제가 될 수 있는 문자 발견
      if (char === '\n' || char === '\r' || (char.charCodeAt(0) < 32 && char !== '\t')) {
        // 문제 발견: 문자열이 제대로 종료되지 않음
        problematicPos = stringStart
        break
      }
      // 매우 긴 문자열도 문제일 수 있음 (AI가 잘린 경우)
      if (i - stringStart > 10000) {
        problematicPos = stringStart
        break
      }
    }
  }

  // 문제가 있는 문자열을 찾았으면 해당 속성 전체 제거
  if (problematicPos > 0) {
    // 문자열이 시작한 위치 전까지 유지
    let cutPos = problematicPos
    
    // 속성 이름의 시작 찾기 (이전 콤마나 중괄호)
    for (let i = problematicPos - 1; i >= 0; i--) {
      if (json[i] === ',') {
        cutPos = i
        break
      } else if (json[i] === '{' || json[i] === '}') {
        cutPos = i + 1
        break
      }
    }
    
    fixed = json.slice(0, cutPos).trim()
    
    // 마지막 콤마 제거
    if (fixed.endsWith(',')) {
      fixed = fixed.slice(0, -1).trim()
    }
    
    // 중괄호 밸런스 맞추기
    const openCount = (fixed.match(/\{/g) || []).length
    const closeCount = (fixed.match(/\}/g) || []).length
    if (openCount > closeCount) {
      fixed = fixed.trimEnd() + '}'.repeat(openCount - closeCount)
    }
    
    return fixed
  }

  // 다른 접근: 마지막 불완전한 속성 찾기
  // 큰따옴표로 시작하지만 종료되지 않은 속성 찾기
  const unterminatedPattern = /("([^"\\]|\\.)*$)/m
  const match = json.match(unterminatedPattern)
  if (match && match.index !== undefined) {
    // 불완전한 문자열 시작 위치 찾기
    const startPos = match.index
    // 이전 콤마나 중괄호 찾기
    for (let i = startPos - 1; i >= 0; i--) {
      if (json[i] === ',') {
        fixed = json.slice(0, i).trim()
        if (fixed.endsWith(',')) {
          fixed = fixed.slice(0, -1).trim()
        }
        const openCount = (fixed.match(/\{/g) || []).length
        const closeCount = (fixed.match(/\}/g) || []).length
        if (openCount > closeCount) {
          fixed = fixed.trimEnd() + '}'.repeat(openCount - closeCount)
        }
        return fixed
      } else if (json[i] === '{') {
        fixed = json.slice(0, i + 1).trim() + '}'
        return fixed
      }
    }
  }

  // 마지막 수단: 마지막 콤마 이후 제거
  const lastCommaIdx = json.lastIndexOf(',')
  if (lastCommaIdx > json.length * 0.8) {
    // 마지막 부분에 콤마가 있으면 그 이후 제거 시도
    fixed = json.slice(0, lastCommaIdx).trim()
    const openCount = (fixed.match(/\{/g) || []).length
    const closeCount = (fixed.match(/\}/g) || []).length
    if (openCount > closeCount) {
      fixed = fixed.trimEnd() + '}'.repeat(openCount - closeCount)
    }
  }

  return fixed
}

const tryRecoverFromUnterminatedString = (json: string): unknown | null => {
  // 1. 개선된 문자열 수정 시도
  try {
    const fixed = fixUnterminatedString(json)
    const recovered: unknown = JSON.parse(fixed)
    if (hasCoreFields(recovered)) {
      return recovered
    }
  } catch {
    // 계속 시도
  }

  // 2. improved_prompt 섹션이 불완전한 경우, 해당 섹션만 제거 시도 (선택적 필드이므로)
  // 하지만 가능하면 보존하려고 시도
  const improvedPromptMatch = json.match(/(,\s*"improved_prompt"\s*:\s*\{)([\s\S]*)/)
  if (improvedPromptMatch) {
    // improved_prompt가 있지만 불완전한 경우, 해당 섹션만 제거
    const beforeImprovedPrompt = json.slice(0, improvedPromptMatch.index || 0)
    const testJson = beforeImprovedPrompt.trim().replace(/,$/, '') + '}'
    const balanced = balanceJsonBraces(testJson)
    try {
      const recovered: unknown = JSON.parse(balanced)
      if (hasCoreFields(recovered)) {
        // improved_prompt가 없어도 핵심 필드는 있으므로 반환
        return recovered
      }
    } catch {
      // 계속 시도
    }
  }

  // 3. 마지막 불완전한 속성 제거 시도
  const lastCommaMatch = json.lastIndexOf(',')
  if (lastCommaMatch > 0) {
    const testJson = json.slice(0, lastCommaMatch) + '}'
    const balanced = balanceJsonBraces(testJson)
    try {
      const recovered: unknown = JSON.parse(balanced)
      if (hasCoreFields(recovered)) {
        return recovered
      }
    } catch {
      // 실패
    }
  }

  return null
}

const parseAnalysisResult = (content: string): AnalysisResult => {
  const extracted = extractJsonBlock(content)
  const balanced = balanceJsonBraces(extracted)
  let jsonContent = sanitizeJsonString(balanced)

  let parsed: unknown
  try {
    // Unterminated string 오류 사전 방지 및 재시도
    try {
      parsed = JSON.parse(jsonContent)
    } catch (preError) {
      if (preError instanceof SyntaxError && preError.message.includes('Unterminated string')) {
        // 여러 번 시도 (최대 3회)
        let attempt = 0
        let currentJson = jsonContent
        while (attempt < 3) {
          try {
            currentJson = fixUnterminatedString(currentJson)
            parsed = JSON.parse(currentJson)
            jsonContent = currentJson // 성공한 버전으로 업데이트
            break
          } catch (retryError) {
            attempt++
            if (attempt >= 3 || !(retryError instanceof SyntaxError && retryError.message.includes('Unterminated string'))) {
              // 재시도 실패 시 tryRecoverFromUnterminatedString 시도
              const recovered = tryRecoverFromUnterminatedString(jsonContent)
              if (recovered && hasCoreFields(recovered)) {
                parsed = recovered
                break
              }
              throw retryError
            }
          }
        }
      } else {
        throw preError
      }
    }

    if (!hasCoreFields(parsed)) {
      console.error('필수 필드 누락:', {
        hasOverallScore: false,
        hasGrade: false,
        hasScores: false,
      })
      throw new Error('분석 결과가 올바른 형식이 아닙니다.')
    }

    const core = parsed as { overall_score: number } & Record<string, unknown>

    if (core.overall_score === -404) {
      if (!('error_message' in core)) {
        console.error('무효한 프롬프트이지만 error_message가 없습니다.')
        throw new Error('무효한 프롬프트에 대한 사유가 없습니다.')
      }
      return core as unknown as AnalysisResult
    }

    if (!('feedback' in core) || !('summary' in core)) {
      console.error('유효한 프롬프트이지만 필수 필드 누락:', {
        hasFeedback: 'feedback' in core,
        hasSummary: 'summary' in core,
      })
      throw new Error('분석 결과가 올바른 형식이 아닙니다.')
    }

    return core as unknown as AnalysisResult
  } catch (error) {
    console.error('❌ JSON 파싱 실패!')
    console.error('에러:', error)
    console.error('파싱 시도한 내용 길이:', jsonContent.length)

    if (error instanceof SyntaxError && error.message.includes('Unterminated string')) {
      const recovered = tryRecoverFromUnterminatedString(jsonContent)
      if (recovered && hasCoreFields(recovered)) return recovered as AnalysisResult

      throw new Error(
        `JSON 파싱 오류: ${error.message}. AI 응답이 불완전합니다. 다시 시도해주세요.`
      )
    }

    throw new Error(
      `JSON 파싱 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}. AI가 올바른 JSON 형식으로 응답하지 않았습니다.`
    )
  }
}

const POST = async (request: NextRequest) => {
  try {
    validateEnvironment()

    const body: AnalyzeRequest = await request.json()
    const { prompt } = body

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
        temperature: 0.3,
        max_tokens: 8192,
        top_p: 0.9,
        timeout: 45000,
      }
    )

    const analysisResult = parseAnalysisResult(response)

    // 비로그인 익명 분석 요청 로깅 (프롬프트 원문은 저장하지 않음)
    try {
      const hdrs = await headers()
      const cookieStore = await cookies()
      const anon = cookieStore.get('pl_anon')?.value || null
      if (!anon) {
        // identify는 /api/anon/log에서 처리되므로 여기서는 토큰이 없으면 생성하지 않음
      }
      const admin = createSupabaseAdminClient()
      await admin.from('anonymous_events').insert({
        anon_token: anon || crypto.randomUUID(),
        event: 'analyze_request',
        metadata: { prompt_length: prompt.length },
        ip: hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || hdrs.get('x-real-ip') || null,
        user_agent: hdrs.get('user-agent') || null,
      })
    } catch (e) {
      // 로깅 실패는 앱 동작에 영향 주지 않음
    }

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

export { POST }