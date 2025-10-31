import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseAdminClient, createSupabaseServerClient } from '@/src/lib/supabaseServer'

const DELETE = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get('authorization')
    const bearer = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7)
      : undefined

    const supabase = await createSupabaseServerClient(bearer)
    const { data: userData, error: authError } = await supabase.auth.getUser()
    if (authError || !userData.user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    const userId = userData.user.id

    const { error: delSavedErr } = await supabase
      .from('saved_prompts')
      .delete()
      .eq('user_id', userId)

    if (delSavedErr) {
      console.error('saved_prompts 삭제 실패:', delSavedErr)
      return NextResponse.json({ success: false, error: '데이터 정리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    const { error: delAnalysesErr } = await supabase
      .from('prompt_analyses')
      .delete()
      .eq('user_id', userId)

    if (delAnalysesErr) {
      console.error('prompt_analyses 삭제 실패:', delAnalysesErr)
      return NextResponse.json({ success: false, error: '데이터 정리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    const admin = createSupabaseAdminClient()
    const { error: adminErr } = await admin.auth.admin.deleteUser(userId)
    if (adminErr) {
      console.error('Auth 사용자 삭제 실패:', adminErr)
      return NextResponse.json({ success: false, error: '계정 삭제 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('계정 삭제 처리 오류:', e)
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export { DELETE }


