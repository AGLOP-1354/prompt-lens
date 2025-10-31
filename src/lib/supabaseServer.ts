import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase 서버 클라이언트 생성
 *
 * Next.js App Router의 서버 컴포넌트 및 API Route에서 사용
 * - RLS 정책이 적용된 인증된 요청 처리
 * - 쿠키 기반 세션 관리
 *
 * @returns Supabase 클라이언트 인스턴스
 */
export async function createSupabaseServerClient(accessToken?: string) {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options?: Parameters<typeof cookieStore.set>[2]) {
        try {
          cookieStore.set(name, value, options)
        } catch {
          // Server Component에서는 쿠키 설정 불가할 수 있음
        }
      },
      remove(name: string, options?: Parameters<typeof cookieStore.set>[2]) {
        try {
          cookieStore.set(name, '', { ...(options || {}), maxAge: 0 })
        } catch {
          // ignore
        }
      },
    },
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  })
}

/**
 * Supabase Admin 클라이언트 생성
 *
 * RLS를 우회하여 모든 데이터에 접근 가능한 관리자 클라이언트
 * 주의: 보안에 민감한 작업에만 사용
 *
 * @returns Supabase Admin 클라이언트 인스턴스
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase Admin 환경변수가 설정되지 않았습니다.')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
