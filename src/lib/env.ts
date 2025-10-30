/**
 * 환경변수 헬퍼
 * 타입 안전한 환경변수 접근을 제공합니다.
 */

export const env = {
  // 앱 설정
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'PromptLens',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // API 설정
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',

  // Supabase 설정 (클라이언트 사용)
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  // OAuth 리다이렉트 (공개 URL). Supabase 제공자 설정의 Redirect URLs 와 일치해야 함
  oauthRedirectUrl:
    process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // 분석 설정
  minPromptLength: Number(process.env.NEXT_PUBLIC_MIN_PROMPT_LENGTH) || 10,
  maxPromptLength: Number(process.env.NEXT_PUBLIC_MAX_PROMPT_LENGTH) || 5000,
  analysisTimeout: Number(process.env.NEXT_PUBLIC_ANALYSIS_TIMEOUT) || 5000,

  // 개발 환경 체크
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const

/**
 * 서버 사이드 전용 환경변수
 * 클라이언트에서는 접근할 수 없습니다.
 */
export const serverEnv = {
  // AI API 키 (백엔드 구현 시 사용)
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
} as const

// 타입 export
export type Env = typeof env
export type ServerEnv = typeof serverEnv
