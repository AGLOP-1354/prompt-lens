import { NextRequest, NextResponse } from 'next/server'

import { createSupabaseServerClient } from '@/src/lib/supabaseServer'

const GET = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get('authorization')
    const bearer = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7)
      : undefined
    const supabase = await createSupabaseServerClient(bearer)
    const { data: userData, error } = await supabase.auth.getUser()

    if (error || !userData.user) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 })
    }

    const user = userData.user

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        user_metadata: user.user_metadata,
      },
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export { GET }


