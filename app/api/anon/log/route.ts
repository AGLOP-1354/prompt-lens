import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'

import { createSupabaseAdminClient } from '@/src/lib/supabaseServer'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365
const COOKIE_NAME = 'pl_anon'

function getClientIp(h: Headers): string | null {
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip')?.trim() ||
    null
  )
}

function getUserAgent(h: Headers): string | null {
  return h.get('user-agent') || null
}

async function ensureAnonCookie(): Promise<string> {
  const store = await cookies()
  const existing = store.get(COOKIE_NAME)?.value
  if (existing) return existing
  const token = crypto.randomUUID()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: ONE_YEAR_SECONDS,
    path: '/',
  })
  return token
}

const POST = async (req: NextRequest) => {
  try {
    const hdrs = await headers()
    const anonToken = await ensureAnonCookie()
    const body = await req.json().catch(() => ({}))
    const event: string | undefined = body.event
    const metadata: unknown = body.metadata ?? {}

    if (!event || typeof event !== 'string') {
      return NextResponse.json({ success: false, error: 'event는 필수입니다.' }, { status: 400 })
    }

    const ip = getClientIp(hdrs)
    const ua = getUserAgent(hdrs)

    const admin = createSupabaseAdminClient()
    const { error } = await admin.from('anonymous_events').insert({
      anon_token: anonToken,
      event,
      metadata,
      ip,
      user_agent: ua,
    })

    if (error) {
      console.error('익명 이벤트 기록 실패:', error)
      return NextResponse.json({ success: false, error: '로그 기록 실패' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('익명 이벤트 처리 오류:', e)
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}

export { POST }


