import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/src/lib/supabaseServer'
import type { SavedPromptInsert } from '@/src/types/database'

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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const favoriteOnly = searchParams.get('favorite') === 'true'
    const tag = searchParams.get('tag')

    let query = supabase
      .from('saved_prompts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (favoriteOnly) {
      query = query.eq('is_favorite', true)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    const { data, error, count } = await query

    if (error) {
      console.error('프롬프트 조회 오류:', error)
      return NextResponse.json({ success: false, error: '프롬프트를 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        prompts: data,
        total: count,
      },
    })
  } catch (error) {
    console.error('프롬프트 조회 오류:', error)
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
    const { title, content, tags = [], is_favorite = false } = body

    if (!title || !content) {
      return NextResponse.json({ success: false, error: '제목과 내용은 필수입니다.' }, { status: 400 })
    }

    if (content.length < 10 || content.length > 5000) {
      return NextResponse.json({ success: false, error: '프롬프트는 10자 이상 5,000자 이하여야 합니다.' }, { status: 400 })
    }

    const insertData: SavedPromptInsert = {
      user_id: user.id,
      title,
      content,
      tags,
      is_favorite,
    }

    const { data, error } = await supabase.from('saved_prompts').insert(insertData).select().single()

    if (error) {
      console.error('프롬프트 저장 오류:', error)
      return NextResponse.json({ success: false, error: '프롬프트를 저장하는 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('프롬프트 저장 오류:', error)
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export { GET, POST }