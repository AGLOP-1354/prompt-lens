import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/src/lib/supabaseServer'
import type { PromptAnalysisInsert } from '@/src/types/database'

const GET = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get('authorization')
    const bearer = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7)
      : undefined
    const supabase = await createSupabaseServerClient(bearer)
    const { data: userData, error: authError } = await supabase.auth.getUser()
    const user = userData.user

    if (authError || !user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data, error, count } = await supabase
      .from('prompt_analyses')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('분석 기록 조회 오류:', error)
      return NextResponse.json({ success: false, error: '분석 기록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        history: data,
        total: count,
      },
    })
  } catch (error) {
    console.error('분석 기록 조회 오류:', error)
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

const POST = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get('authorization')
    const bearer = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7)
      : undefined
    const supabase = await createSupabaseServerClient(bearer)
    const { data: userData, error: authError } = await supabase.auth.getUser()
    const user = userData.user

    if (authError || !user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()

    const requiredFields = [
      'original_prompt',
      'overall_score',
      'grade',
      'clarity_score',
      'specificity_score',
      'structure_score',
      'completeness_score',
      'efficiency_score',
    ]

    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json({ success: false, error: `필수 필드가 누락되었습니다: ${field}` }, { status: 400 })
      }
    }

    const insertData: Partial<PromptAnalysisInsert> = {
      user_id: user.id,
      original_prompt: body.original_prompt,
      overall_score: body.overall_score,
      grade: body.grade,
      clarity_score: body.clarity_score,
      specificity_score: body.specificity_score,
      structure_score: body.structure_score,
      completeness_score: body.completeness_score,
      efficiency_score: body.efficiency_score,

      clarity_feedback: body.clarity_feedback || '',
      specificity_feedback: body.specificity_feedback || '',
      structure_feedback: body.structure_feedback || '',
      completeness_feedback: body.completeness_feedback || '',
      efficiency_feedback: body.efficiency_feedback || '',

      improved_prompt: body.improved_prompt || '',
      improvements: body.improvements || [],

      summary: body.summary,
      is_saved: body.is_saved || false,
      saved_prompt_id: body.saved_prompt_id,
      analysis_version: '2.0',
    }

    const { data, error } = await supabase.from('prompt_analyses').insert(insertData).select().single()

    if (error) {
      console.error('분석 기록 저장 오류:', error)
      return NextResponse.json({ success: false, error: '분석 기록을 저장하는 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('분석 기록 저장 오류:', error)
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export { GET, POST }