'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from './env'

let browserClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (browserClient) return browserClient

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  browserClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      // PKCE + redirect 기반. 리다이렉트 URL은 Supabase 대시보드의 Provider Redirect URLs 와 일치해야 합니다.
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
  return browserClient
}


