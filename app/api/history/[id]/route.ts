import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/src/lib/supabaseServer'

const DELETE = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const supabase = await createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { error } = await supabase.from('prompt_analyses').delete().eq('id', id).eq('user_id', user.id)

    if (error) {
      console.error('분석 기록 삭제 오류:', error)
      return NextResponse.json({ success: false, error: '분석 기록을 삭제하는 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '분석 기록이 삭제되었습니다.',
    })
  } catch (error) {
    console.error('분석 기록 삭제 오류:', error)
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export { DELETE }
