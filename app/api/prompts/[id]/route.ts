import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/src/lib/supabaseServer'
import type { SavedPromptUpdate } from '@/src/types/database'

const PATCH = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
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
    const { title, content, tags, is_favorite } = body

    const updateData: SavedPromptUpdate = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (tags !== undefined) updateData.tags = tags
    if (is_favorite !== undefined) updateData.is_favorite = is_favorite

    if (content && (content.length < 10 || content.length > 5000)) {
      return NextResponse.json({ success: false, error: '프롬프트는 10자 이상 5,000자 이하여야 합니다.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('saved_prompts')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('프롬프트 업데이트 오류:', error)
      return NextResponse.json({ success: false, error: '프롬프트를 업데이트하는 중 오류가 발생했습니다.' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ success: false, error: '프롬프트를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('프롬프트 업데이트 오류:', error)
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

const DELETE = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
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

    const { error } = await supabase.from('saved_prompts').delete().eq('id', id).eq('user_id', user.id)

    if (error) {
      console.error('프롬프트 삭제 오류:', error)
      return NextResponse.json({ success: false, error: '프롬프트를 삭제하는 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '프롬프트가 삭제되었습니다.',
    })
  } catch (error) {
    console.error('프롬프트 삭제 오류:', error)
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export { PATCH, DELETE }