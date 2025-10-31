/**
 * Lightweight fetch wrapper for PromptLens (Web/Next.js)
 * - Cookie 기반 내부 API(`/api/*`) 우선
 * - 필요 시 Bearer 토큰 주입 가능(getAccessToken)
 * - JSON 기본 처리, 타임아웃/리트라이 지원
 */

export class ApiError extends Error {
  public readonly statusCode: number
  public readonly data?: unknown

  constructor(statusCode: number, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.data = data
  }
}

export type RetryPolicy = {
  maxAttempts?: number
  delayMs?: number
  backoffFactor?: number
}

export type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  timeoutMs?: number
  retry?: RetryPolicy
  onUnauthorized?: () => void
}

export type ApiResponse<T> = {
  data: T
  status: number
  headers: Headers
}

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_RETRY: Required<RetryPolicy> = {
  maxAttempts: 3,
  delayMs: 800,
  backoffFactor: 2,
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

const isRetriableStatus = (status: number): boolean => {
  // Too Many Requests + 5xx + Request Timeout
  return status === 429 || status === 408 || (status >= 500 && status < 600)
}

const extractErrorMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null
  const obj = payload as Record<string, unknown>
  return (
    (obj.message as string) ||
    (obj.error as string) ||
    (obj.msg as string) ||
    (obj.detail as string) ||
    null
  )
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    clearTimeout(timeoutId)
    return res
  } catch (error) {
    clearTimeout(timeoutId)
    if ((error as Error).name === 'AbortError') {
      throw new ApiError(408, '요청 시간이 초과되었습니다.')
    }
    throw error
  }
}

type ClientConfig = {
  /** baseUrl은 외부 API 사용 시에만 지정. 내부 API는 상대 경로 사용 권장 */
  baseUrl?: string
  /** 필요 시 액세스 토큰 제공 함수 (예: 외부 API) */
  getAccessToken?: () => Promise<string | null> | string | null
}

export function createApiClient(config: ClientConfig = {}) {
  const { baseUrl = '', getAccessToken } = config

  const resolveUrl = (endpoint: string): string => {
    if (!baseUrl) return endpoint // 내부 API 상대 경로
    if (endpoint.startsWith('http')) return endpoint
    return `${baseUrl}${endpoint}`
  }

  const buildHeaders = async (init?: HeadersInit): Promise<HeadersInit> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...init,
    }
    const token = typeof getAccessToken === 'function' ? await getAccessToken() : null
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`
    }
    return headers
  }

  const request = async <T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> => {
    const { timeoutMs = DEFAULT_TIMEOUT_MS, retry = {}, headers, body, onUnauthorized, ...rest } = options
    const policy: Required<RetryPolicy> = {
      maxAttempts: retry.maxAttempts ?? DEFAULT_RETRY.maxAttempts,
      delayMs: retry.delayMs ?? DEFAULT_RETRY.delayMs,
      backoffFactor: retry.backoffFactor ?? DEFAULT_RETRY.backoffFactor,
    }

    const url = resolveUrl(endpoint)
    const finalHeaders = await buildHeaders(headers)

    let lastError: unknown

    for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
      try {
        const res = await fetchWithTimeout(
          url,
          {
            ...rest,
            method,
            headers: finalHeaders,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            // 내부 API는 쿠키 세션 기반이므로 credentials 생략(동일 오리진 기본 포함)
          },
          timeoutMs
        )

        const contentType = res.headers.get('content-type') || ''
        const isJson = contentType.includes('application/json')

        if (!res.ok) {
          let errorPayload: unknown = null
          try {
            errorPayload = isJson ? await res.json() : await res.text()
          } catch {
            // ignore parsing error
          }

          if (res.status === 401 && typeof onUnauthorized === 'function') {
            onUnauthorized()
          }

          if (attempt < policy.maxAttempts && isRetriableStatus(res.status)) {
            const wait = policy.delayMs * Math.pow(policy.backoffFactor, attempt - 1)
            await sleep(wait)
            continue
          }

          const message = extractErrorMessage(errorPayload) || `HTTP ${res.status}: ${res.statusText}`
          throw new ApiError(res.status, message, errorPayload)
        }

        if (res.status === 204) {
          return { data: {} as T, status: res.status, headers: res.headers }
        }

        const data = (isJson ? await res.json() : ((await res.text()) as unknown)) as T
        return { data, status: res.status, headers: res.headers }
      } catch (error) {
        lastError = error
        // 네트워크/타임아웃/Abort/ApiError 408 등 재시도
        const status = error instanceof ApiError ? error.statusCode : undefined
        const retriable =
          status ? isRetriableStatus(status) : isLikelyNetworkError(error as Error)
        if (retriable && attempt < policy.maxAttempts) {
          const wait = policy.delayMs * Math.pow(policy.backoffFactor, attempt - 1)
          await sleep(wait)
          continue
        }
        throw error
      }
    }

    throw lastError ?? new Error('알 수 없는 오류가 발생했습니다.')
  }

  return {
    get: <T>(endpoint: string, options?: RequestOptions) => request<T>('GET', endpoint, options),
    post: <T, D = unknown>(endpoint: string, data?: D, options?: RequestOptions) =>
      request<T>('POST', endpoint, { ...options, body: data }),
    put: <T, D = unknown>(endpoint: string, data?: D, options?: RequestOptions) =>
      request<T>('PUT', endpoint, { ...options, body: data }),
    patch: <T, D = unknown>(endpoint: string, data?: D, options?: RequestOptions) =>
      request<T>('PATCH', endpoint, { ...options, body: data }),
    delete: <T>(endpoint: string, options?: RequestOptions) => request<T>('DELETE', endpoint, options),
  }
}

// 앱 기본 클라이언트 (내부 API 전용, 쿠키 세션 기반)
export const apiClient = createApiClient()

// 인증 토큰을 자동 주입하는 클라이언트 (내부 API 권한 필요한 요청에 사용)
export const authedApiClient = createApiClient({
  getAccessToken: async () => {
    try {
      const { getSupabaseClient } = await import('@/src/lib/supabaseClient')
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()
      return data.session?.access_token ?? null
    } catch {
      return null
    }
  },
})

function isLikelyNetworkError(error: Error): boolean {
  const msg = (error?.message || '').toLowerCase()
  return (
    msg.includes('network') ||
    msg.includes('timeout') ||
    msg.includes('fetch') ||
    msg.includes('connection') ||
    msg.includes('abort')
  )
}


